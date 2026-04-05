const fs = require('fs');
const path = 'src/app/grad-presentation/page.tsx';
let data = fs.readFileSync(path, 'utf8');

const versions = [5, 10, 15, 24];

versions.forEach(v => {
  const searchStr = '          <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-indigo-500 mt-4 rounded-full"></div>\n        </div>\n      </div>';
  const replaceStr = '          <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-indigo-500 mt-4 rounded-full"></div>\n        </div>\n        <a \n          href="http://localhost:3000/demonstration"\n          className="px-6 py-3 bg-blue-600/90 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] transition-all flex items-center gap-3 border border-blue-400/30 whitespace-nowrap"\n          target="_blank"\n        >\n          <span>Launch V' + v + ' Visualizer</span>\n          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>\n        </a>\n      </div>';
  data = data.replace(searchStr, replaceStr);
});

fs.writeFileSync(path, data, 'utf8');
console.log('Buttons inserted!');
