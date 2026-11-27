import {readFileSync,writeFileSync,existsSync,mkdirSync,cpSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const run=(cmd,args)=>execFileSync(cmd,args,{stdio:'inherit',shell:process.platform==='win32'});
const edit=(p,f)=>writeFileSync(p,f(readFileSync(p,'utf8')));
mkdirSync('dist',{recursive:true});
cpSync('www','dist',{recursive:true});
edit('dist/index.html',html=>html.replace('href="icon.png"','href="icon.svg"').replaceAll('0.6.5','0.7.0').replace('</style>',`
/* Capacitor 8 SystemBars safe area fallback for older Android WebViews. */
:root{--tafl-top:var(--safe-area-inset-top,env(safe-area-inset-top,0px));--tafl-bottom:var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px));--tafl-left:var(--safe-area-inset-left,env(safe-area-inset-left,0px));--tafl-right:var(--safe-area-inset-right,env(safe-area-inset-right,0px))}
body{padding:var(--tafl-top) var(--tafl-right) var(--tafl-bottom) var(--tafl-left);background-color:#1f1d19}
main{min-height:calc(100dvh - var(--tafl-top) - var(--tafl-bottom))}
main.inGame{min-height:calc(100dvh - var(--tafl-top) - var(--tafl-bottom))}
.modal,#ruleModal{padding-top:calc(14px + var(--tafl-top));padding-bottom:calc(14px + var(--tafl-bottom))}
</style>`));
if(!existsSync('android'))run('npx',['cap','add','android']);
run('npx',['cap','sync','android']);
edit('android/app/build.gradle',s=>s.replace(/versionCode\s+\d+/,'versionCode 14').replace(/versionName\s+["'][^"']+["']/,'versionName "0.7.0"'));
const res='android/app/src/main/res';
mkdirSync(res+'/drawable',{recursive:true});
writeFileSync(res+'/drawable/tafl_icon.xml',`<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
<path android:fillColor="#2a261e" android:pathData="M0,0H108V108H0Z"/>
<path android:strokeColor="#cfad72" android:strokeWidth="2" android:pathData="M26,26H82V82H26Z"/>
<path android:strokeColor="#78654b" android:strokeWidth="1" android:pathData="M44,26V82M64,26V82M26,44H82M26,64H82"/>
<path android:fillColor="#d8b378" android:pathData="M54,34A20,20 0,1 1,54 74A20,20 0,1 1,54 34Z"/>
<path android:strokeColor="#302a21" android:strokeWidth="3" android:strokeLineCap="round" android:strokeLineJoin="round" android:pathData="M54,38V48M49,43H59M44,64L41,49L49,55L54,48L59,55L67,49L64,64ZM44,68H64"/>
</vector>`);
edit('android/app/src/main/AndroidManifest.xml',s=>s.replace(/@mipmap\/ic_launcher_round/g,'@drawable/tafl_icon').replace(/@mipmap\/ic_launcher/g,'@drawable/tafl_icon'));
console.log('Capacitor Android project prepared');
