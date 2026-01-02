import { BlogPost, Poem, SectionPair } from './types';

// Mock Data simulates the Obsidian files
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'quiet-night',
    title: '夜の静寂について',
    date: '2025-10-01',
    type: 'blog',
    excerpt: 'ランプの光が机を照らす。コーヒーの香りが漂う。何も聞こえない時間こそが、思考の揺りかごとなる。',
    content: `
      ランプの光が机を照らす。コーヒーの香りが漂う。
      
      現代社会において、真の静寂を見つけることは難しくなった。
      常に通知音が鳴り響き、情報の波が押し寄せる。
      
      しかし、午前2時のこの部屋だけは別世界だ。
      ここには、自分と、思考と、わずかな光しかない。
      
      孤独は寂しさではない。それは自己との対話のための贅沢な空間なのだ。
      この静けさの中で、言葉は重みを増し、思考は深淵へと沈んでいく。
    `
  },
  {
    slug: 'digital-gardening',
    title: 'Digital_Gardening',
    date: '2025-10-05',
    type: 'blog',
    excerpt: 'ウェブサイトは建築ではなく、庭であるべきだ。完成することはなく、常に手入れを必要とする有機的な存在として。',
    content: `
      ウェブサイトは建築ではなく、庭であるべきだ。
      
      多くの人は「完成」を目指すが、デジタルの世界に完成はない。
      種を撒き（アイデアを書き留め）、水をやり（内容を更新し）、剪定する（古い情報を整理する）。
      
      このサイトもまた、私の思考の庭である。
      雑草が生えることもあるだろう。枯れる花もあるだろう。
      しかし、そのプロセスそのものが、生きている証なのだ。
    `
  }
];

export const POEMS: Poem[] = [
  {
    slug: 'moonshadow',
    title: '月影',
    date: '2025-10-01',
    type: 'poem',
    excerpt: '静かな夜の裂け目から 白い風が流れ込む...',
    content: `
      静かな夜の裂け目から
      白い風が流れ込む
      
      言葉にならない
      幾千の星屑が
      
      私の輪郭を
      少しずつ
      削り取っていく
      
      残されたのは
      透明な
      不在だけ
    `
  },
  {
    slug: 'echo',
    title: '反響',
    date: '2025-10-08',
    type: 'poem',
    excerpt: '声は壁に当たり、形を変えて戻ってくる。それは誰の言葉か。',
    content: `
      声は壁に当たり
      形を変えて
      戻ってくる
      
      それは
      誰の言葉か
      
      鏡の中の
      見知らぬ他人が
      口パクで
      笑っている
      
      音のない
      世界で
    `
  }
];

// Combine them into pairs for the layout
export const CONTENT_PAIRS: SectionPair[] = [
  {
    id: 'pair-1',
    blog: BLOG_POSTS[0],
    poem: POEMS[0],
  },
  {
    id: 'pair-2',
    blog: BLOG_POSTS[1],
    poem: POEMS[1],
  },
];