import { marked } from 'marked';

const renderer = new marked.Renderer();
renderer.image = ({ href, title, text }) => {
  return `<img src="${href}" alt="${text || ''}" title="${title || ''}" class="lazy-load" loading="lazy" decoding="async" />`;
};

marked.use({ renderer, breaks: true });

const content = "Hello **world**";
const parsed = marked.parse(content);

console.log('Type of parsed:', typeof parsed);
console.log('Value:', parsed);
console.log('Is Promise:', parsed instanceof Promise);
