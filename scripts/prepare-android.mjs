import {readFileSync,writeFileSync,existsSync,mkdirSync,cpSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const run=(cmd,args)=>execFileSync(cmd,args,{stdio:'inherit',shell:process.platform==='win32'});
const edit=(p,f)=>writeFileSync(p,f(readFileSync(p,'utf8')));
mkdirSync('dist',{recursive:true});
cpSync('www','dist',{recursive:true});
edit('dist/index.html',html=>html.replace('href="icon.png"','href="icon.svg"').replaceAll('0.6.5','0.9.2').replace('</style>',`
/* Capacitor 8 SystemBars safe area fallback for older Android WebViews. */
:root{--tafl-top:var(--safe-area-inset-top,env(safe-area-inset-top,0px));--tafl-bottom:var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px));--tafl-left:var(--safe-area-inset-left,env(safe-area-inset-left,0px));--tafl-right:var(--safe-area-inset-right,env(safe-area-inset-right,0px))}
body{padding:var(--tafl-top) var(--tafl-right) var(--tafl-bottom) var(--tafl-left);background-color:var(--bg)}
main{min-height:calc(100dvh - var(--tafl-top) - var(--tafl-bottom))}
main.inGame{min-height:calc(100dvh - var(--tafl-top) - var(--tafl-bottom))}
.modal,#ruleModal{padding-top:calc(14px + var(--tafl-top));padding-bottom:calc(14px + var(--tafl-bottom))}
</style>`));
if(!existsSync('android'))run('npx',['cap','add','android']);
if(!readFileSync('android/app/build.gradle','utf8').includes('com.playtufl'))throw new Error('Generated Android project has stale package ID; remove generated android/ and regenerate.');
run('npx',['cap','sync','android']);
edit('android/app/build.gradle',s=>s.replace(/versionCode\s+\d+/,'versionCode 22').replace(/versionName\s+["'][^"']+["']/,'versionName "0.9.2"'));
// Test variant installs beside the production app and never overwrites existing saves.
edit('android/app/build.gradle',s=>s.includes('applicationIdSuffix')?s:s.replace(/buildTypes\s*\{/, 'buildTypes {\n        debug { applicationIdSuffix ".test" }'));
mkdirSync('android/app/src/debug',{recursive:true});
writeFileSync('android/app/src/debug/AndroidManifest.xml', '<manifest xmlns:android="http://schemas.android.com/apk/res/android" xmlns:tools="http://schemas.android.com/tools"><application android:label="TAFL Test" tools:replace="android:label"/></manifest>');
const res='android/app/src/main/res';
mkdirSync(res+'/drawable',{recursive:true});
writeFileSync(res+'/drawable/tafl_icon.xml',`<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
<path android:fillColor="#d0a65f" android:pathData="M0,0H108V108H0Z"/>
<path android:fillColor="#f8e6ab" android:strokeColor="#936b2c" android:strokeWidth="3" android:pathData="M54,3A51,51 0,1 1,54 105A51,51 0,1 1,54 3Z"/>
<path android:strokeColor="#d0ac6d" android:strokeWidth="1.5" android:pathData="M54,9A45,45 0,1 1,54 99A45,45 0,1 1,54 9Z"/>
<path android:strokeColor="#65401c" android:strokeWidth="3.5" android:strokeLineCap="round" android:strokeLineJoin="round" android:pathData="M54,24V38M47,31H61M39,69C37,58 29,55 29,47C29,41 37,38 42,43L54,55L66,43C71,38 79,41 79,47C79,55 71,58 69,69ZM39,69H69V79H39ZM43,74H65"/>
</vector>`);
edit('android/app/src/main/AndroidManifest.xml',s=>s.replace(/@mipmap\/ic_launcher_round/g,'@drawable/tafl_icon').replace(/@mipmap\/ic_launcher/g,'@drawable/tafl_icon'));
console.log('Capacitor Android project prepared');
