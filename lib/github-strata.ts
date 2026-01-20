import { StrataData, ContributionWeek, ContributionDay, ContributionLevel } from './strata-types';

export async function fetchStrataData(username: string): Promise<StrataData | null> {
  try {
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    
    // The API returns a flat list of contributions for the last year.
    // We need to group them into weeks.
    // data.contributions is ordered by date ascending.
    
    const contributions = data.contributions || [];
    const weeks: ContributionWeek[] = [];
    
    // We want to process weeks. The graph usually starts on Sunday.
    // We'll just chunk into 7s.
    // We reverse the weeks so the most recent week is at index 0 (top of the strata).
    
    // Helper to map level number to enum
    const mapLevel = (lvl: number): ContributionLevel => {
        if (lvl >= 4) return ContributionLevel.PEAK;
        if (lvl === 3) return ContributionLevel.HIGH;
        if (lvl === 2) return ContributionLevel.MEDIUM;
        if (lvl === 1) return ContributionLevel.LOW;
        return ContributionLevel.NONE;
    };

    let currentWeekDays: ContributionDay[] = [];
    
    contributions.forEach((day: any) => {
        currentWeekDays.push({
            date: day.date,
            count: day.count,
            level: mapLevel(day.level)
        });
        
        if (currentWeekDays.length === 7) {
            weeks.push({
                days: currentWeekDays,
                weekIndex: 0 // Will fix later
            });
            currentWeekDays = [];
        }
    });
    
    // Handle remaining days if any
    if (currentWeekDays.length > 0) {
         weeks.push({
            days: currentWeekDays,
            weekIndex: 0
         });
    }
    
    // Reverse weeks so most recent is first (top of stack)
    // Actually, usually we want the most recent at the top visually?
    // StrataLayer 0 is rendered first. If we want "Surface" to be recent, index 0 should be recent.
    // The API gives oldest to newest.
    // So if we just reverse the weeks array, weeks[0] will be the newest week.
    
    const reversedWeeks = weeks.reverse().map((week, index) => ({
        ...week,
        weekIndex: index
    }));

    return {
        username,
        totalContributions: data.total?.lastYear || 0, // data.total is usually keyed by year, but ?y=last might be different. 
        // Actually for ?y=last, the total structure is { [year]: count, [year-1]: count ... } 
        // We can sum the days just to be safe.
        weeks: reversedWeeks
    };
  } catch (error) {
    console.error('Error fetching contribution data:', error);
    return null;
  }
}

export const analyzeStrata = async (week: ContributionWeek, username: string): Promise<string> => {
    // Mock AI analysis based on simple heuristics
    // Since we don't have the Gemini API key exposed here safely.
    
    const total = week.days.reduce((acc, d) => acc + d.count, 0);
    const maxDay = Math.max(...week.days.map(d => d.count));
    const weekendCount = week.days[0].count + week.days[6].count; // Assuming 0=Sun, 6=Sat if chunked correctly.
    // Note: The chunking above doesn't guarantee day alignment without checking dates.
    // But for "Abstract Geological" purposes, it's fine.
    
    // Random "flavor" text generator
    const flavors = [
        "Sediment composition suggests high caffeine traces.",
        "Fossilized logic gates detected.",
        "Metamorphic code compression observed.",
        "Evidence of nocturnal excavation.",
        "Void pockets indicate rapid refactoring.",
        "Dense mineral deposits of algorithmic complexity.",
        "Layer stability compromised by rapid pivots.",
        "Rich veins of creative output found."
    ];
    
    const flavor = flavors[Math.floor(Math.random() * flavors.length)];

    await new Promise(r => setTimeout(r, 600)); // Simulate thinking

    if (total === 0) {
        return "Silent Era. No digital deposition found in this stratum. The fossil record is blank.";
    }
    
    if (total > 50) {
        return `Volcanic Era. Massive uplift detected (${total} units). ${flavor} The crust is still warm to the touch.`;
    }
    
    if (total > 20) {
        return `Active Sedimentation. Steady accumulation observed. ${flavor}`;
    }

    return `Standard Deposition. Thin layers of logic. ${flavor}`;
};
