import { auth, loadMyData, onUserChanged, saveMyData } from './firebase-service.js';

const languageKey = 'badagap-language';
let language = localStorage.getItem(languageKey) || 'ko';
const originalText = new WeakMap();
const originalAttributes = new WeakMap();

const words = {
  '부산 바다값': 'Busan Sea Price',
  '부산 바다값 커뮤니티': 'Busan Sea Price Community',
  '부산 수산물 시세': 'Busan seafood prices',
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
  output = output.replace(/(자갈치시장|민락회타운|기장시장)에는 아직 등록된 구매 제보가 없습니다\./g, (_, market) => `There are no purchase reports for ${words[market]} yet.`);
  output = output.replace(/첫 번째 경험을 공유해 주세요\./g, 'Share the first experience.');
  output = output.replace(/(\d+)건/g, '$1 posts');
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
