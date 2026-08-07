import { auth, loadMyData, onUserChanged, saveMyData } from './firebase-service.js';

const languageKey = 'badagap-language';
let language = localStorage.getItem(languageKey) || 'ko';
const originalText = new WeakMap();
const originalAttributes = new WeakMap();

const words = {
  '부산 바다값': 'Busan Sea Price',
  '부산 바다값 커뮤니티': 'Busan Sea Price Community',
  '부산 수산물 시세': 'Busan seafood prices',
  '부산 시장 현황가': 'Busan market price', '부산 시장가': 'Busan market price', '시민 제보 중앙값': 'Citizen report median',
  '최근 제보 범위': 'Recent report range', '최근 제보': 'Recent reports', '최근 24시간': 'Past 24 hours',
  '어제 대비': 'vs. yesterday', '7일 평균': '7-day average', '공식 도매가': 'Official wholesale price',
  '공식 도매 평균': 'Official wholesale average', '오늘 업데이트': 'Updated today', '방금 업데이트': 'Updated just now',
  '데이터 기준': 'Data criteria', '추가 모니터링 품목': 'Additional monitored items', '공식 자료 확인 후 시세 카드에 추가됩니다.': 'Added to price cards after official data is verified.',
  '평균가': 'Average', '최고가': 'Highest', '최저가': 'Lowest', '거래 정보': 'Trade information',
  '시세는 바다처럼, 계속 움직입니다.': 'Prices move like the sea.',
  '가격은 시장 상황과 제보에 따라 계속 변경됩니다.': 'Prices change continuously with market conditions and reports.',
  '도매 경락가·시장 판매가·시민 구매 제보가는 서로 다른 기준입니다. 가격 상태는 시장 판매가와 시민 제보 중앙값을 비교해 표시합니다.': 'Wholesale auction prices, market prices, and citizen reports use different standards. Price status compares market prices with the citizen median.',
  '새 시세 반영': 'New prices applied',
  '로그인': 'Log in', '로그아웃': 'Log out', '회원가입': 'Sign up',
  '회원가입과 로그인이 완료되었습니다.': 'Your account has been created and you are signed in.',
  '이메일': 'Email', '비밀번호': 'Password', '닉네임': 'Display name',
  '처음이신가요? · 회원가입': 'New here? · Sign up', '이미 계정이 있어요 · 로그인': 'Already have an account? · Log in',
  '전체': 'All', '어류': 'Fish', '오징어·문어류': 'Squid & Octopus', '갑각류': 'Crustaceans', '조개·패류': 'Shellfish',
  '부산의 수산 시장': 'Busan seafood markets', '관심 시장': 'Favorite markets', '관심시장': 'Favorite', '관심 종류': 'Favorite categories',
  '수산물 시세': 'Seafood prices', '수산물 시세 전체 보기': 'View all seafood prices', '수산물 시세 접기': 'Collapse seafood prices',
  '가격 제보': 'Price report', '현장 가격 제보': 'On-site price report', '제보 등록하기': 'Submit report',
  '시장 선택': 'Choose market', '상점 이름': 'Shop name', '구매한 수산물': 'Seafood purchased',
  '구매 가격': 'Purchase price', '수산물 상태': 'Seafood condition', '회 상태': 'Sashimi condition',
  '상점 평가': 'Shop rating', '후기': 'Review', '회 구매 경험 제보': 'Sashimi purchase report',
  '시장별 커뮤니티 인기글': 'Popular posts by market', '전체 보기 →': 'View all →',
  '시민이 남긴 실제 구매 경험으로 시장과 상점을 확인하세요.': 'Check markets and shops through real purchase experiences shared by residents.',
  '시장별 실제 구매 후기를 모아 보세요': 'Explore real purchase reviews by market',
  '커뮤니티 둘러보기 →': 'Browse community →', '커뮤니티에 후기 등록하기 →': 'Post a community review →',
  '인기 후기': 'Popular review', '후기': 'Review', '도움돼요': 'Helpful', '도움돼요 취소': 'Remove helpful', '삭제': 'Delete',
  '사진 없음': 'No photo', '상점 정보 없음': 'No shop information', '상태 제보': 'Condition report',
  '신선함': 'Fresh', '보통': 'Average', '확인 필요': 'Needs checking', '상태 확인 필요': 'Condition needs checking',
  '자갈치시장': 'Jagalchi Market', '민락회타운': 'Millak Raw Fish Town', '기장시장': 'Gijang Market',
  '자갈치 바다상회': 'Jagalchi Bada Store', '민락 활어마당': 'Millak Live Fish House', '기장 앞바다수산': 'Gijang Seaside Seafood', '자갈치 금빛수산': 'Jagalchi Gold Seafood',
  '자갈치': 'Jagalchi', '민락': 'Millak', '활어마당': 'Live Fish House',
  '광어(넙치)': 'Olive flounder', '강도다리': 'Starry flounder', '돌가자미': 'Stone flounder', '참가자미': 'Brown sole',
  '고등어': 'Mackerel', '전갱이': 'Horse mackerel', '갈치': 'Hairtail', '삼치': 'Spanish mackerel', '꽁치': 'Pacific saury',
  '청어': 'Herring', '방어': 'Yellowtail', '부시리': 'Amberjack', '연어': 'Salmon', '숭어': 'Grey mullet', '참숭어': 'So-iuy mullet',
  '농어': 'Sea bass', '민어': 'Croaker', '병어': 'Butterfish', '조기': 'Yellow croaker', '참조기': 'Large yellow croaker',
  '대구': 'Cod', '명태': 'Alaska pollock', '임연수어': 'Atka mackerel', '우럭': 'Rockfish', '볼락': 'Black rockfish',
  '참돔': 'Red seabream', '감성돔': 'Black porgy', '돌돔': 'Striped beakfish', '줄돔': 'Striped beakfish',
  '능성어': 'Grouper', '자바리': 'Giant grouper', '붉바리': 'Red grouper', '복어': 'Pufferfish', '아귀': 'Monkfish', '양태': 'Flathead',
  '붕장어': 'Conger eel', '갯장어': 'Pike conger', '먹장어': 'Hagfish', '홍어': 'Skate', '가오리': 'Ray', '금태': 'Golden tilefish',
  '오징어': 'Squid', '갑오징어': 'Cuttlefish', '한치': 'Spear squid', '문어': 'Octopus', '돌문어': 'Rock octopus', '낙지': 'Small octopus', '주꾸미': 'Webfoot octopus',
  '꽃게': 'Blue crab', '대게': 'Snow crab', '홍게': 'Red snow crab', '킹크랩': 'King crab', '바닷가재': 'Lobster', '흰다리새우': 'Whiteleg shrimp', '대하': 'King prawn', '보리새우': 'Kuruma shrimp', '분홍새우': 'Pink shrimp',
  '전복': 'Abalone', '굴': 'Oyster', '홍합': 'Mussel', '바지락': 'Manila clam', '가리비': 'Scallop', '키조개': 'Pen shell', '소라': 'Sea snail', '피조개': 'Blood clam', '새조개': 'Jackknife clam', '개조개': 'Surf clam', '백합': 'Hard clam', '동죽': 'Surf clam', '꼬막': 'Cockle',
  '활어': 'Live fish', '선어': 'Chilled fish', '냉장': 'Refrigerated', '냉동': 'Frozen', '국산': 'Korean', '중국산': 'Chinese', '일본산': 'Japanese',
  '부산': 'Busan', '통영': 'Tongyeong', '완도': 'Wando', '목포': 'Mokpo', '기장': 'Gijang', '나로도': 'Naro Island',
  '포장': 'Pack', '상자': 'boxes',
  '방금 전': 'Just now', '자료 수집 중': 'Collecting data', '오늘 거래 정보 없음': 'No trade information today',
  '공식 도매 기준가': 'Official wholesale price', '부산 시장 현황가': 'Busan market price', '최근 시민 제보 중앙값': 'Recent citizen median',
  '평균보다 저렴': 'Below average', '적정 가격': 'Fair price', '조금 높음': 'Slightly high', '가격 확인 필요': 'Check price',
  '오늘': 'Today', '7일': '7 days', '30일': '30 days', '데이터 출처': 'Data sources',
  '관심 공간': 'Favorites', '좋아하는 수산물': 'Favorite seafood', '취소': 'Remove',
  '위치·길찾기 보기': 'View location & directions', '메인으로': 'Home',
  '한국어': '한국어', 'English': 'English'
};

function translate(source) {
  if (language !== 'en') return source;
  let output = source;
  Object.entries(words).sort((a, b) => b[0].length - a[0].length).forEach(([ko, en]) => { output = output.split(ko).join(en); });
  // Cards are rendered dynamically, so normalize the recurring price labels and units here too.
  const phrases = [
    [/시민\s*제보\s*중앙값/g, 'Citizen report median'],
    [/최근\s*제보\s*범위/g, 'Recent report range'],
    [/최근\s*24시간/g, 'Past 24 hours'],
    [/어제\s*대비/g, 'vs. yesterday'],
    [/7일\s*평균/g, '7-day average'],
    [/공식\s*도매\s*(기준가|평균)/g, 'Official wholesale price'],
    [/부산\s*시장\s*(현황가|가격|가)/g, 'Busan market price'],
    [/데이터\s*기준/g, 'Data criteria'],
    [/추가\s*모니터링\s*품목/g, 'Additional monitored items'],
    [/오늘\s*업데이트/g, 'Updated today'],
    [/방금\s*업데이트/g, 'Updated just now'],
    [/자료\s*수집\s*중/g, 'Collecting data'],
    [/가격\s*확인\s*필요/g, 'Check price'],
    [/적정\s*가격/g, 'Fair price'],
    [/평균보다\s*저렴/g, 'Below average'],
    [/조금\s*높음/g, 'Slightly high']
  ];
  phrases.forEach(([pattern, replacement]) => { output = output.replace(pattern, replacement); });
  output = output
    .replace(/부산\s*수산물\s*시세/g, 'Busan seafood prices')
    .replace(/자갈치시장/g, 'Jagalchi Market')
    .replace(/민락회타운/g, 'Millak Raw Fish Town')
    .replace(/기장시장/g, 'Gijang Market')
    .replace(/자갈치\s*바다상회/g, 'Jagalchi Bada Store')
    .replace(/민락\s*활어마당/g, 'Millak Live Fish House')
    .replace(/기장\s*앞바다수산/g, 'Gijang Seaside Seafood')
    .replace(/자갈치\s*금빛수산/g, 'Jagalchi Gold Seafood')
    .replace(/자갈치/g, 'Jagalchi')
    .replace(/민락/g, 'Millak')
    .replace(/기장/g, 'Gijang')
    .replace(/활어마당/g, 'Live Fish House')
    .replace(/(\d[\d,]*)원/g, '$1 KRW');
  output = output.replace(/(자갈치시장|민락회타운|기장시장)에는 아직 등록된 구매 제보가 없습니다\./g, (_, market) => `There are no purchase reports for ${words[market]} yet.`);
  output = output.replace(/첫 번째 경험을 공유해 주세요\./g, 'Share the first experience.');
  output = output.replace(/(\d+)건/g, '$1 posts').replace(/(\d+)미/g, '$1 fish').replace(/(\d+)마리/g, '$1 fish');
  output = output.replace(/조회 (\d+)/g, '$1 views');
  return output;
}

function shouldSkip(node) {
  const parent = node.parentElement;
  return parent?.closest?.('[data-i18n-ignore]') || parent?.tagName === 'SCRIPT' || parent?.tagName === 'STYLE';
}

function translateTextNode(node) {
  if (shouldSkip(node) || !node.nodeValue.trim()) return;
  if (!originalText.has(node)) originalText.set(node, node.nodeValue);
  node.nodeValue = translate(originalText.get(node));
}

function translateAttributes(element) {
  if (element.closest?.('[data-i18n-ignore]')) return;
  ['placeholder', 'title', 'aria-label'].forEach(attribute => {
    if (!element.hasAttribute?.(attribute)) return;
    if (!originalAttributes.has(element)) originalAttributes.set(element, {});
    const saved = originalAttributes.get(element);
    if (!(attribute in saved)) saved[attribute] = element.getAttribute(attribute);
    element.setAttribute(attribute, translate(saved[attribute] || ''));
  });
}

function applyLanguage(root = document.body) {
  document.documentElement.lang = language === 'en' ? 'en' : 'ko';
  document.title = language === 'en'
    ? (location.pathname.includes('커뮤니티') ? 'Busan Sea Price | Community' : 'Busan Sea Price | Live Seafood Prices')
    : (location.pathname.includes('커뮤니티') ? '부산 바다값 | 회 구매 제보 커뮤니티' : '부산 바다값 | 실시간 수산물 시세');
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(translateTextNode);
  root.querySelectorAll?.('*').forEach(translateAttributes);
  const select = document.querySelector('#languageSelect'); if (select) select.value = language;
}

async function persistLanguage() {
  localStorage.setItem(languageKey, language);
  if (auth.currentUser) {
    try { await saveMyData(auth.currentUser.uid, { language }); } catch (_) {}
  }
}

function mountLanguageSelect() {
  if (document.querySelector('#languageSelect')) return;
  const select = document.createElement('select');
  select.id = 'languageSelect'; select.dataset.i18nIgnore = 'true';
  select.setAttribute('aria-label', 'Language');
  select.innerHTML = '<option value="ko">한국어</option><option value="en">English</option>';
  select.style.cssText = 'border:1px solid #dbe7eb;background:#fff;border-radius:99px;padding:8px 10px;color:#09283e;font:700 11px Manrope;cursor:pointer';
  select.value = language;
  select.addEventListener('change', async () => { language = select.value; await persistLanguage(); applyLanguage(); });
  const login = document.querySelector('#login');
  if (login) login.before(select);
  else document.querySelector('.head')?.append(select);
}

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
    else if (node.nodeType === Node.ELEMENT_NODE) applyLanguage(node);
  }));
});

document.addEventListener('DOMContentLoaded', () => {
  mountLanguageSelect(); applyLanguage(); observer.observe(document.body, { childList:true, subtree:true });
});

onUserChanged(async user => {
  if (!user) return;
  try {
    const profile = await loadMyData(user.uid);
    if (profile.language && profile.language !== language) { language = profile.language; applyLanguage(); }
  } catch (_) {}
});
