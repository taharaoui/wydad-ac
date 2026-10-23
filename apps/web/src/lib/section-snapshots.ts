import type { InstagramFeed } from './instagram';

/**
 * Local copies of each section account (public/images/sections/{key}, 23 Oct 2026), shown when
 * Instagram refuses the live request. Regenerate by re-reading each /embed/ page.
 */
export const SECTION_SNAPSHOTS: Record<string, InstagramFeed> = {
  swimming: {
    profile: { username: 'wydadnatationofficiel', fullName: 'Wydad Athletic Club - Section Natation', followers: 11361, posts: 310, avatar: '/images/sections/swimming/profile.jpg' },
    posts: [
      { shortcode: 'DeuiDKJMUIP', kind: 'video', caption: '🔴⚪ WYDAD NATATION | INSIDE TRAINING 💪🏊‍♂️', image: '/images/sections/swimming/DeuiDKJMUIP.jpg', width: 608, height: 1080, url: 'https://www.instagram.com/p/DeuiDKJMUIP/' },
      { shortcode: 'Deqp79bMoVb', kind: 'image', caption: '🔴⚪ WYDAD NATATION | STAGE DE PRÉPARATION', image: '/images/sections/swimming/Deqp79bMoVb.jpg', width: 1080, height: 1080, url: 'https://www.instagram.com/p/Deqp79bMoVb/' },
      { shortcode: 'Deh_dLKMR3u', kind: 'video', caption: '🔴⚪ WYDAD NATATION - O’DARB | UNE BELLE SOIRÉE DE CONVIVIALITÉ ❤️🤍', image: '/images/sections/swimming/Deh_dLKMR3u.jpg', width: 608, height: 1080, url: 'https://www.instagram.com/p/Deh_dLKMR3u/' },
      { shortcode: 'Dehyey4I0iK', kind: 'image', caption: '', image: '/images/sections/swimming/Dehyey4I0iK.jpg', width: 1080, height: 1080, url: 'https://www.instagram.com/p/Dehyey4I0iK/' },
      { shortcode: 'DeeeOEmjODc', kind: 'carousel', caption: '🔴⚪ WYDAD NATATION | UNE COLLABORATION RENFORCÉE AU SERVICE DE NOS CHAMPIONS', image: '/images/sections/swimming/DeeeOEmjODc.jpg', width: 810, height: 1080, url: 'https://www.instagram.com/p/DeeeOEmjODc/' },
      { shortcode: 'DePp56FsFQi', kind: 'image', caption: '🔴⚪ DEUX ANCIENS INTERNATIONAUX, UNE MÊME PASSION : LA NATATION', image: '/images/sections/swimming/DePp56FsFQi.jpg', width: 886, height: 1080, url: 'https://www.instagram.com/p/DePp56FsFQi/' },
    ],
  },
  boxing: {
    profile: { username: 'wac_boxe', fullName: 'Wydad Athletic club - Section Boxe', followers: 28459, posts: 96, avatar: '/images/sections/boxing/profile.jpg' },
    posts: [
      { shortcode: 'Dezu_aMDR2H', kind: 'carousel', caption: 'Wydad boxing - العائلة ❤️🔴⚪️', image: '/images/sections/boxing/Dezu_aMDR2H.jpg', width: 810, height: 1080, url: 'https://www.instagram.com/p/Dezu_aMDR2H/' },
      { shortcode: 'DeurfF8t331', kind: 'video', caption: 'Wydad boxing | ملاكمات الوداد 🥊🔴⚪', image: '/images/sections/boxing/DeurfF8t331.jpg', width: 608, height: 1080, url: 'https://www.instagram.com/p/DeurfF8t331/' },
      { shortcode: 'DepEIDaty3U', kind: 'video', caption: 'Wydad boxing - Training💪🔴⚪️', image: '/images/sections/boxing/DepEIDaty3U.jpg', width: 608, height: 1080, url: 'https://www.instagram.com/p/DepEIDaty3U/' },
      { shortcode: 'DemJbrYNKl3', kind: 'video', caption: 'Wydad Boxing – Technique & Discipline 💪🔴⚪️', image: '/images/sections/boxing/DemJbrYNKl3.jpg', width: 608, height: 1080, url: 'https://www.instagram.com/p/DemJbrYNKl3/' },
      { shortcode: 'Dekt2ivCDMg', kind: 'carousel', caption: '🥈يهنئ الوداد الرياضي فرع الملاكمة بطله موطي طه بمناسبة إحرازه المرتبة الثانية في بطولة المغرب، والقادم أفضل بإذن الله. 🇲🇦🔴⚪', image: '/images/sections/boxing/Dekt2ivCDMg.jpg', width: 768, height: 768, url: 'https://www.instagram.com/p/Dekt2ivCDMg/' },
      { shortcode: 'Dekdx4GNCSQ', kind: 'video', caption: 'Wydad boxing - 💪🔴⚪️', image: '/images/sections/boxing/Dekdx4GNCSQ.jpg', width: 608, height: 1080, url: 'https://www.instagram.com/p/Dekdx4GNCSQ/' },
    ],
  },
  fencing: {
    profile: { username: 'wydadescrime', fullName: 'WYDAD SECTION ESCRIME', followers: 6683, posts: 220, avatar: '/images/sections/fencing/profile.jpg' },
    posts: [
      { shortcode: 'DezpsXhiTwz', kind: 'video', caption: '🤺 Cap sur Dakar 2026 ! 🇲🇦', image: '/images/sections/fencing/DezpsXhiTwz.jpg', width: 608, height: 1080, url: 'https://www.instagram.com/p/DezpsXhiTwz/' },
      { shortcode: 'DeznuzmiHvi', kind: 'carousel', caption: '🤺 Cap sur Dakar 2026 ! 🇲🇦', image: '/images/sections/fencing/DeznuzmiHvi.jpg', width: 810, height: 1080, url: 'https://www.instagram.com/p/DeznuzmiHvi/' },
      { shortcode: 'DezWDfiDCCV', kind: 'carousel', caption: 'Formation anti-dopage pour nos escrimeurs wydadis a Rabat à l’AMAD pour obtenir leur diplomes « ADEL » .', image: '/images/sections/fencing/DezWDfiDCCV.jpg', width: 1080, height: 1080, url: 'https://www.instagram.com/p/DezWDfiDCCV/' },
      { shortcode: 'DewaoIpMUUV', kind: 'image', caption: 'Notre athlète Hiba ZAIMI 1ere année cadettes u15 représentera le Maroc aux JOJ dakar 2026 au fleuret Féminin juniors u20 ⚪️🔴🤺🤺🤺 #joj #da', image: '/images/sections/fencing/DewaoIpMUUV.jpg', width: 861, height: 1080, url: 'https://www.instagram.com/p/DewaoIpMUUV/' },
      { shortcode: 'Deh223uDCr0', kind: 'carousel', caption: '⚪️🔴 NOS PETITES CHAMPIONNES ESCRIMEUSES 🤺 la releve du wac est assurée', image: '/images/sections/fencing/Deh223uDCr0.jpg', width: 1040, height: 1080, url: 'https://www.instagram.com/p/Deh223uDCr0/' },
      { shortcode: 'DeVJ1i_DLnP', kind: 'carousel', caption: '⚪️🔴🤺🤺', image: '/images/sections/fencing/DeVJ1i_DLnP.jpg', width: 1026, height: 1080, url: 'https://www.instagram.com/p/DeVJ1i_DLnP/' },
    ],
  },
  handball: {
    profile: { username: 'wydadhandballofficiel', fullName: 'Wydad Athletic Club - Handball', followers: 15168, posts: 205, avatar: '/images/sections/handball/profile.jpg' },
    posts: [
      { shortcode: 'Ddrmu6qDp4V', kind: 'carousel', caption: 'المدرب عبد المجيد الزاولي يجدد عقده مع فرع كرة اليد بنادي الوداد الرياضي لمدة موسم واحد قابل للتجديد', image: '/images/sections/handball/Ddrmu6qDp4V.jpg', width: 864, height: 1080, url: 'https://www.instagram.com/p/Ddrmu6qDp4V/' },
      { shortcode: 'DcdTJoiuzxH', kind: 'image', caption: 'يتقدم نادي الوداد الرياضي بخالص التهنئة إلى الأمة الإسلامية بمناسبة ذكرى المولد النبوي الشريف، كل عام وأنتم بخير.', image: '/images/sections/handball/DcdTJoiuzxH.jpg', width: 1080, height: 1080, url: 'https://www.instagram.com/p/DcdTJoiuzxH/' },
      { shortcode: 'DbZI9CYOGQs', kind: 'image', caption: 'الذكرى 27 لعيد العرش المجيد', image: '/images/sections/handball/DbZI9CYOGQs.jpg', width: 867, height: 1080, url: 'https://www.instagram.com/p/DbZI9CYOGQs/' },
      { shortcode: 'DafSGy5jhqp', kind: 'carousel', caption: 'Une saison. Un rêve. Une épopée. ⚪️🔴', image: '/images/sections/handball/DafSGy5jhqp.jpg', width: 867, height: 1080, url: 'https://www.instagram.com/p/DafSGy5jhqp/' },
      { shortcode: 'DZ_UHn7sanp', kind: 'image', caption: '🇲🇦🔥 إلى دور الـ32!', image: '/images/sections/handball/DZ_UHn7sanp.jpg', width: 864, height: 1080, url: 'https://www.instagram.com/p/DZ_UHn7sanp/' },
      { shortcode: 'DZ2zGgQjKZS', kind: 'carousel', caption: 'DIMA WYDAD ⚪️🔴', image: '/images/sections/handball/DZ2zGgQjKZS.jpg', width: 865, height: 1080, url: 'https://www.instagram.com/p/DZ2zGgQjKZS/' },
    ],
  },
  women: {
    profile: { username: 'wydadacwomen', fullName: 'Wydad Football Women', followers: 91667, posts: 1312, avatar: '/images/sections/women/profile.jpg' },
    posts: [
      { shortcode: 'De2Ea-pCNvB', kind: 'carousel', caption: 'ALL EYES ON AS FAR', image: '/images/sections/women/De2Ea-pCNvB.jpg', width: 863, height: 1080, url: 'https://www.instagram.com/p/De2Ea-pCNvB/' },
      { shortcode: 'DezljIhCCnN', kind: 'carousel', caption: 'The Focus Is on Saturday 🔥⚔️', image: '/images/sections/women/DezljIhCCnN.jpg', width: 864, height: 1080, url: 'https://www.instagram.com/p/DezljIhCCnN/' },
      { shortcode: 'DezhsmmiJbl', kind: 'carousel', caption: 'Goalkeepers’ Work🧤', image: '/images/sections/women/DezhsmmiJbl.jpg', width: 864, height: 1080, url: 'https://www.instagram.com/p/DezhsmmiJbl/' },
      { shortcode: 'Dew_0rGiKPo', kind: 'carousel', caption: 'THE WORK NEVER STOPS. 🔴⚪', image: '/images/sections/women/Dew_0rGiKPo.jpg', width: 810, height: 1080, url: 'https://www.instagram.com/p/Dew_0rGiKPo/' },
      { shortcode: 'DeufCBMiGOE', kind: 'carousel', caption: 'Focused on What’s Next. 🔥', image: '/images/sections/women/DeufCBMiGOE.jpg', width: 865, height: 1080, url: 'https://www.instagram.com/p/DeufCBMiGOE/' },
      { shortcode: 'DerRYo-iKzR', kind: 'carousel', caption: 'Beyond the result, we keep moving forward. 🔴⚪', image: '/images/sections/women/DerRYo-iKzR.jpg', width: 864, height: 1080, url: 'https://www.instagram.com/p/DerRYo-iKzR/' },
    ],
  },
  academy: {
    profile: { username: 'wydadacschool', fullName: 'Wydad Football School', followers: 28586, posts: 139, avatar: '/images/sections/academy/profile.jpg' },
    posts: [
      { shortcode: 'DduOXjNMT7J', kind: 'video', caption: 'THIS IS WYDAD. 🔴', image: '/images/sections/academy/DduOXjNMT7J.jpg', width: 608, height: 1080, url: 'https://www.instagram.com/p/DduOXjNMT7J/' },
      { shortcode: 'Dc_XJqnDm8D', kind: 'image', caption: '🔴⚪️ Depuis toujours, le Wydad n’a pas seulement formé des joueurs. Il a formé une identité, une fierté, une école. Nos plus grandes légende', image: '/images/sections/academy/Dc_XJqnDm8D.jpg', width: 1080, height: 1080, url: 'https://www.instagram.com/p/Dc_XJqnDm8D/' },
      { shortcode: 'DbAnzQzPps6', kind: 'video', caption: 'Une première édition gravée dans les mémoires. ❤️🤍', image: '/images/sections/academy/DbAnzQzPps6.jpg', width: 608, height: 1080, url: 'https://www.instagram.com/p/DbAnzQzPps6/' },
      { shortcode: 'Da7yvrtB8ee', kind: 'video', caption: 'Un après-midi 100% fun au Wydad Summer Camp ! ☁️🥞❤️🤍', image: '/images/sections/academy/Da7yvrtB8ee.jpg', width: 608, height: 1080, url: 'https://www.instagram.com/p/Da7yvrtB8ee/' },
      { shortcode: 'Da53OQsDch8', kind: 'carousel', caption: 'Place à la créativité et à la réflexion ! Entre jeux de société, atelier robotique et moments de détente, nos petits campeurs ont appris tou', image: '/images/sections/academy/Da53OQsDch8.jpg', width: 904, height: 739, url: 'https://www.instagram.com/p/Da53OQsDch8/' },
      { shortcode: 'Da2iDN1s47G', kind: 'video', caption: 'Des jeux, des rires et des étoiles plein les yeux… Voilà l’esprit du Wydad Summer Camp. 🤍 Merci à @uniq.maroc pour cette magnifique journée', image: '/images/sections/academy/Da2iDN1s47G.jpg', width: 608, height: 1080, url: 'https://www.instagram.com/p/Da2iDN1s47G/' },
    ],
  },
  basketball: {
    profile: { username: 'wacbasketball', fullName: 'Wydad Athletic Club - Basketball 🏀🇲🇦', followers: 54013, posts: 428, avatar: '/images/sections/basketball/profile.jpg' },
    posts: [
      { shortcode: 'DezsVSZEanG', kind: 'carousel', caption: 'JOURNÉE 3 | الجولة الثالثة', image: '/images/sections/basketball/DezsVSZEanG.jpg', width: 864, height: 1080, url: 'https://www.instagram.com/p/DezsVSZEanG/' },
      { shortcode: 'Dep1utPIiJo', kind: 'image', caption: 'VICTOIRE À L’EXTÉRIEUR !', image: '/images/sections/basketball/Dep1utPIiJo.jpg', width: 1080, height: 1080, url: 'https://www.instagram.com/p/Dep1utPIiJo/' },
      { shortcode: 'Dee8jhVRSYE', kind: 'image', caption: 'TON HISTOIRE EN ROUGE ET BLANC COMMENCE ICI !', image: '/images/sections/basketball/Dee8jhVRSYE.jpg', width: 810, height: 1080, url: 'https://www.instagram.com/p/Dee8jhVRSYE/' },
      { shortcode: 'DeW_Tegsgve', kind: 'image', caption: 'First game. First win. More to come. 🔥', image: '/images/sections/basketball/DeW_Tegsgve.jpg', width: 1080, height: 1080, url: 'https://www.instagram.com/p/DeW_Tegsgve/' },
      { shortcode: 'DeWz3RnMxv6', kind: 'image', caption: 'Résultat de la mi-temps', image: '/images/sections/basketball/DeWz3RnMxv6.jpg', width: 1080, height: 1080, url: 'https://www.instagram.com/p/DeWz3RnMxv6/' },
      { shortcode: 'DdSIBnWMCtu', kind: 'image', caption: '', image: '/images/sections/basketball/DdSIBnWMCtu.jpg', width: 736, height: 976, url: 'https://www.instagram.com/p/DdSIBnWMCtu/' },
    ],
  },
};
