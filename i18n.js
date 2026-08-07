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
  '부산공동어시장 현황': 'Busan Cooperative Fish Market overview', '8/6 입항': 'Aug 6 arrivals', '8/5 위판': 'Aug 5 auction',
  '전체 평균 위판단가': 'Overall average auction price', '고등어·매가리': 'Mackerel · horse mackerel', '잡어': 'Mixed fish', '톤': 'tons',
  '수산물 종류 검색': 'Search seafood types', '이름 또는 별칭 입력 (예: 조피볼락, 대방어, 하모)': 'Enter a name or alias (e.g. rockfish, large yellowtail, pike conger)',
  '수산물 시세 전체 보기': 'View all seafood prices', '수산물 시세 접기': 'Collapse seafood prices', '개 품목': 'items', '시장': 'Markets', '홈': 'Home',
  '예: 바다상회': 'e.g. Bada Store', '예: 광어 1kg': 'e.g. Olive flounder 1 kg',
  '회 사진 (선택 · 휴대폰 카메라 촬영 가능)': 'Sashimi photo (optional · mobile camera available)', '상점 평가': 'Shop rating', '후기': 'Review',
  '가격, 신선도, 손질 상태, 서비스 경험을 사실 중심으로 적어주세요.': 'Please describe the price, freshness, preparation, and service based on your experience.',
  '제보 등록하기': 'Submit report', '선택한 시장의 커뮤니티에만 저장됩니다. 사진 없이도 제보할 수 있으며, 시연 데이터는 이 브라우저에만 저장됩니다.': 'This report is saved only in the selected market community. A photo is optional, and demo data is stored only in this browser.',
  '사진 선택': 'Choose photo', '선택된 파일 없음': 'No file selected', '사진 없음': 'No photo',
  '사진과 경험으로 만드는 더 투명한 시장 정보': 'Clearer market information through photos and real experiences',
  '사진과 경험으로 만드는': 'Created through photos and real experiences', '더 투명한 시장 정보': 'Clearer market information',
  '실제 구매한 회의 상태, 가격, 상점 경험을 남겨주세요. 비방이나 개인정보가 담긴 사진은 등록하지 마세요.': 'Share the sashimi condition, price, and shop experience from your purchase. Please do not post abusive content or photos containing personal information.',
  '바다상회': 'Bada Store', '맛있어요.': 'It was delicious.', '광어 1kg': 'Olive flounder 1 kg',
  '예: 바다상회': 'e.g. Bada Store', '예: 광어 1kg': 'e.g. Olive flounder 1 kg',
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

const japanese = {
  '부산 바다값': '釜山 海の値段', '부산 바다값 커뮤니티': '釜山 海の値段コミュニティ', '부산 수산물 시세': '釜山水産物の相場',
  '홈': 'ホーム', '시장': '市場', '수산물 시세': '水産物の相場', '가격 제보': '価格レポート', '로그인': 'ログイン', '로그아웃': 'ログアウト', '회원가입': '会員登録',
  '시세는 바다처럼, 계속 움직입니다.': '相場は海のように、絶えず動きます。', '가격은 시장 상황과 제보에 따라 계속 변경됩니다.': '価格は市場状況とレポートに応じて変動します。',
  '부산공동어시장 현황': '釜山共同魚市場の状況', '8/6 입항': '8月6日 入荷', '8/5 위판': '8月5日 競り', '전체 평균 위판단가': '全体の平均競り価格',
  '수산물 종류 검색': '水産物の種類を検索', '이름 또는 별칭 입력 (예: 조피볼락, 대방어, 하모)': '名前または別名を入力（例：クロソイ、寒ブリ、ハモ）',
  '전체': 'すべて', '어류': '魚類', '오징어·문어류': 'イカ・タコ類', '갑각류': '甲殻類', '조개·패류': '貝類',
  '부산 시장 현황가': '釜山市場の販売価格', '공식 도매 기준가': '公式卸売基準価格', '시민 제보 중앙값': '市民レポートの中央値',
  '최근 제보 범위': '最近のレポート範囲', '최근 24시간': '過去24時間', '어제 대비': '前日比', '7일 평균': '7日平均',
  '평균보다 저렴': '平均よりお得', '적정 가격': '適正価格', '조금 높음': 'やや高め', '가격 확인 필요': '価格の確認が必要', '자료 수집 중': 'データ収集中',
  '자갈치시장': 'チャガルチ市場', '민락회타운': '民楽刺身タウン', '기장시장': '機張市場', '관심시장': 'お気に入り市場', '데이터 기준': 'データ基準',
  '사진과 경험으로 만드는': '写真と体験でつくる', '더 투명한 시장 정보': 'より透明な市場情報',
  '실제 구매한 회의 상태, 가격, 상점 경험을 남겨주세요. 비방이나 개인정보가 담긴 사진은 등록하지 마세요.': '実際に購入した刺身の状態、価格、お店での体験を共有してください。誹謗中傷や個人情報を含む写真は投稿しないでください。',
  '회 구매 경험 제보': '刺身購入体験レポート', '시장 선택': '市場を選択', '상점 이름': '店舗名', '구매한 수산물': '購入した水産物', '구매 가격': '購入価格', '회 상태': '刺身の状態',
  '신선함': '新鮮', '보통': '普通', '확인 필요': '確認が必要', '회 사진 (선택 · 휴대폰 카메라 촬영 가능)': '刺身の写真（任意・スマホのカメラで撮影可能）',
  '상점 평가': '店舗評価', '후기': 'レビュー', '제보 등록하기': 'レポートを送信', '사진 선택': '写真を選択', '선택된 파일 없음': 'ファイルが選択されていません',
  '예: 바다상회': '例：バダ商会', '예: 광어 1kg': '例：ヒラメ 1kg', '가격, 신선도, 손질 상태, 서비스 경험을 사실 중심으로 적어주세요.': '価格、鮮度、下処理、サービス体験を事実に基づいて入力してください。',
  '선택한 시장의 커뮤니티에만 저장됩니다. 사진 없이도 제보할 수 있으며, 시연 데이터는 이 브라우저에만 저장됩니다.': '選択した市場のコミュニティにのみ保存されます。写真なしでも投稿でき、デモデータはこのブラウザに保存されます。',
  '광어(넙치)': 'ヒラメ', '감성돔': 'クロダイ', '농어': 'スズキ', '병어': 'マナガツオ', '줄돔': 'イサキ', '고등어': 'サバ', '오징어': 'イカ', '문어': 'タコ', '전복': 'アワビ', '굴': 'カキ', '갈치': 'タチウオ', '방어': 'ブリ', '연어': 'サーモン', '우럭': 'クロソイ', '참돔': 'マダイ', '꽃게': 'ワタリガニ', '대게': 'ズワイガニ', '킹크랩': 'タラバガニ', '바지락': 'アサリ', '가리비': 'ホタテ',
  '활어': '活魚', '선어': '鮮魚', '국산': '韓国産', '중국산': '中国産', '일본산': '日本産', '부산': '釜山', '통영': '統営', '완도': '莞島', '목포': '木浦', '기장': '機張',
  '바다상회': 'バダ商会', '맛있어요.': 'おいしかったです。', '도움돼요': '役に立った', '도움돼요 취소': '役に立ったを取り消す', '삭제': '削除', '조회': '閲覧',
  '개 품목': '品目', '방금 업데이트': '更新直後', '오늘 업데이트': '本日更新', '자료 출처': 'データ出典', '공식 도매가': '公式卸売価格', '부산 시장가': '釜山市場価格'
  , '기준 · 자동 갱신 대기': '時点・自動更新待機', '시장별 커뮤니티 인기글': '市場別コミュニティ人気投稿', '전체 보기': 'すべて見る',
  '시민이 남긴 실제 구매 경험으로 시장과 상점을 확인하세요.': '市民が共有した実際の購入体験から、市場と店舗を確認しましょう。', '인기 후기': '人気レビュー', '리뷰': 'レビュー',
  '도매 경락가·시장 판매가·시민 구매 제보가는 서로 다른 기준입니다. 가격 상태는 시장 판매가와 시민 제보 중앙값을 비교해 표시합니다.': '卸売競り価格、市場販売価格、市民購入レポートは基準が異なります。価格状態は市場販売価格と市民レポートの中央値を比較して表示します。',
  '공식 도매가는 경락정보, 시장 현황가는 상인 등록가, 시민 제보가는 최근 24시간 자료의 중앙값을 사용합니다. 제보 3건 미만은 공개하지 않습니다.': '公式卸売価格は競り情報、市場価格は店舗登録価格、市民レポートは過去24時間の中央値を使用します。レポートが3件未満の場合は公開しません。',
  '추가 모니터링 품목': '追加モニタリング品目', '공식 자료 확인 후 시세 카드에 추가됩니다.': '公式資料の確認後、相場カードに追加されます。', '현재 가격은 프로토타입 시연용 데이터이며 실제 시세와 다를 수 있습니다.': '現在の価格はプロトタイプ用のデータであり、実際の相場とは異なる場合があります。',
  '새 시세가 업데이트되었습니다': '新しい相場が更新されました', '맨 위로': 'ページ上部へ', '매가리': 'マアジ', '잡어': '雑魚', '상자': '箱', '톤': 'トン',
  '자갈치 바다상회': 'チャガルチ・バダ商会', '민락 활어마당': '民楽活魚広場', '기장 앞바다수산': '機張沖合水産', '자갈치 금빛수산': 'チャガルチ金色水産', '자갈치 남항상회': 'チャガルチ南港商会', '민락 해풍수산': '民楽海風水産',
  '자갈치': 'チャガルチ', '민락': '民楽', '활어마당': '活魚広場', '앞바다수산': '沖合水産', '금빛수산': '金色水産', '남항상회': '南港商会', '해풍수산': '海風水産',
  '부산의 수산 시장': '釜山の水産市場', '관심 시장': 'お気に入り市場', '최근 범위': '最近の範囲', '시민 제보': '市民レポート', '공식 도매 평균': '公式卸売平均',
  '안흥': '安興', '상자': '箱', '부시리': 'カンパチ', '숭어': 'ボラ', '민어': 'ニベ', '볼락': 'メバル', '돌돔': 'イシダイ', '붕장어': 'アナゴ', '갯장어': 'ハモ', '홍어': 'ガンギエイ', '가오리': 'エイ', '금태': 'アマダイ',
  '갑오징어': 'コウイカ', '한치': 'ケンサキイカ', '주꾸미': 'イイダコ', '홍게': 'ベニズワイガニ', '바닷가재': 'ロブスター', '흰다리새우': 'バナメイエビ', '홍합': 'ムール貝', '키조개': 'タイラギ', '소라': 'サザエ', '새조개': 'トリガイ', '꼬막': 'ハイガイ'
};

const chinese = {
  '부산 바다값': '釜山海鲜价格', '부산 바다값 커뮤니티': '釜山海鲜价格社区', '부산 수산물 시세': '釜山水产品行情',
  '홈': '首页', '시장': '市场', '수산물 시세': '水产品行情', '가격 제보': '价格报告', '로그인': '登录', '로그아웃': '退出登录', '회원가입': '注册',
  '시세는 바다처럼, 계속 움직입니다.': '行情如大海般持续变化。', '가격은 시장 상황과 제보에 따라 계속 변경됩니다.': '价格会根据市场情况和用户报告持续变化。',
  '부산공동어시장 현황': '釜山共同鱼市场现况', '8/6 입항': '8月6日到港', '8/5 위판': '8月5日拍卖', '전체 평균 위판단가': '整体平均拍卖单价',
  '수산물 종류 검색': '搜索水产品种类', '이름 또는 별칭 입력 (예: 조피볼락, 대방어, 하모)': '输入名称或别名（如：黑鲉、大鰤鱼、海鳗）',
  '전체': '全部', '어류': '鱼类', '오징어·문어류': '鱿鱼·章鱼类', '갑각류': '甲壳类', '조개·패류': '贝类',
  '부산 시장 현황가': '釜山市场销售价', '공식 도매 기준가': '官方批发基准价', '시민 제보 중앙값': '市民报告中位数', '최근 제보 범위': '近期报告范围', '최근 24시간': '过去24小时', '어제 대비': '较昨日', '7일 평균': '7日平均',
  '평균보다 저렴': '低于平均价', '적정 가격': '合理价格', '조금 높음': '略高', '가격 확인 필요': '需要确认价格', '자료 수집 중': '数据收集中',
  '자갈치시장': '札嘎其市场', '민락회타운': '民乐生鱼片城', '기장시장': '机张市场', '관심시장': '关注市场', '데이터 기준': '数据标准',
  '사진과 경험으로 만드는': '通过照片和体验打造', '더 투명한 시장 정보': '更透明的市场信息',
  '실제 구매한 회의 상태, 가격, 상점 경험을 남겨주세요. 비방이나 개인정보가 담긴 사진은 등록하지 마세요.': '请分享实际购买的生鱼片状态、价格和店铺体验。请勿发布诽谤内容或包含个人信息的照片。',
  '회 구매 경험 제보': '生鱼片购买体验报告', '시장 선택': '选择市场', '상점 이름': '店铺名称', '구매한 수산물': '购买的水产品', '구매 가격': '购买价格', '회 상태': '生鱼片状态',
  '신선함': '新鲜', '보통': '一般', '확인 필요': '需要确认', '회 사진 (선택 · 휴대폰 카메라 촬영 가능)': '生鱼片照片（可选·可用手机相机拍摄）', '상점 평가': '店铺评分', '후기': '评价', '제보 등록하기': '提交报告',
  '사진 선택': '选择照片', '선택된 파일 없음': '未选择文件', '예: 바다상회': '例：大海商会', '예: 광어 1kg': '例：比目鱼 1kg',
  '가격, 신선도, 손질 상태, 서비스 경험을 사실 중심으로 적어주세요.': '请根据实际体验填写价格、新鲜度、处理状态和服务体验。',
  '선택한 시장의 커뮤니티에만 저장됩니다. 사진 없이도 제보할 수 있으며, 시연 데이터는 이 브라우저에만 저장됩니다.': '仅保存到所选市场的社区。可不上传照片，演示数据仅保存在此浏览器中。',
  '시장별 커뮤니티 인기글': '各市场社区热门帖', '전체 보기': '查看全部', '시민이 남긴 실제 구매 경험으로 시장과 상점을 확인하세요.': '通过市民分享的真实购买体验了解市场和店铺。',
  '도매 경락가·시장 판매가·시민 구매 제보가는 서로 다른 기준입니다. 가격 상태는 시장 판매가와 시민 제보 중앙값을 비교해 표시합니다.': '批发拍卖价、市场销售价和市民购买报告采用不同标准。价格状态根据市场销售价与市民报告中位数进行比较。',
  '공식 도매가는 경락정보, 시장 현황가는 상인 등록가, 시민 제보가는 최근 24시간 자료의 중앙값을 사용합니다. 제보 3건 미만은 공개하지 않습니다.': '官方批发价采用拍卖信息，市场价格采用商户登记价，市民报告采用过去24小时的中位数。少于3条报告时不公开。',
  '추가 모니터링 품목': '其他监测品种', '공식 자료 확인 후 시세 카드에 추가됩니다.': '确认官方资料后将添加到行情卡。', '현재 가격은 프로토타입 시연용 데이터이며 실제 시세와 다를 수 있습니다.': '当前价格为原型演示数据，可能与实际行情不同。',
  '새 시세가 업데이트되었습니다': '新行情已更新', '맨 위로': '返回顶部', '매가리': '竹荚鱼', '잡어': '杂鱼', '상자': '箱', '톤': '吨',
  '광어(넙치)': '比目鱼', '감성돔': '黑鲷', '농어': '海鲈鱼', '병어': '鲳鱼', '줄돔': '鸡鱼', '고등어': '鲭鱼', '갈치': '带鱼', '방어': '鰤鱼', '부시리': '勘八鱼', '연어': '三文鱼', '우럭': '黑鲉', '참돔': '真鲷', '오징어': '鱿鱼', '문어': '章鱼', '전복': '鲍鱼', '굴': '牡蛎', '꽃게': '梭子蟹', '대게': '雪蟹', '킹크랩': '帝王蟹', '바지락': '蛤蜊', '가리비': '扇贝',
  '활어': '活鱼', '선어': '鲜鱼', '국산': '韩国产', '중국산': '中国产', '일본산': '日本产', '부산': '釜山', '통영': '统营', '완도': '莞岛', '목포': '木浦', '기장': '机张',
  '자갈치 바다상회': '札嘎其大海商会', '민락 활어마당': '民乐活鱼广场', '기장 앞바다수산': '机张近海水产', '자갈치 금빛수산': '札嘎其金色水产', '자갈치 남항상회': '札嘎其南港商会', '민락 해풍수산': '民乐海风水产',
  '자갈치': '札嘎其', '민락': '民乐', '활어마당': '活鱼广场', '앞바다수산': '近海水产', '금빛수산': '金色水产', '남항상회': '南港商会', '해풍수산': '海风水产',
  '바다상회': '大海商会', '맛있어요.': '很好吃。', '도움돼요': '有帮助', '도움돼요 취소': '取消有帮助', '삭제': '删除', '조회': '浏览', '개 품목': '个品种', '방금 업데이트': '刚刚更新', '오늘 업데이트': '今日更新', '공식 도매가': '官方批发价', '부산 시장가': '釜山市场价'
  , '커뮤니티': '社区', '맛잇어요': '很好吃。', '오전': '上午', '오후': '下午', 'SEAFOOD PURCHASE REPORT': '海鲜购买报告', 'LIVE DEMO': '实时演示'
};

function translate(source) {
  if (language === 'zh') {
    let output = source;
    Object.entries(chinese).sort((a, b) => b[0].length - a[0].length).forEach(([ko, zh]) => { output = output.split(ko).join(zh); });
    return output.replace(/(\d[\d,]*)원/g, '¥$1').replace(/(\d+)건/g, '$1条').replace(/(\d+)미/g, '$1尾').replace(/(\d+)개\s*품목/g, '$1个品种');
  }
  if (language === 'ja') {
    let output = source;
    Object.entries(japanese).sort((a, b) => b[0].length - a[0].length).forEach(([ko, ja]) => { output = output.split(ko).join(ja); });
    return output.replace(/(\d[\d,]*)원/g, '¥$1').replace(/(\d+)건/g, '$1件').replace(/(\d+)미/g, '$1尾').replace(/(\d+)개\s*품목/g, '$1品目');
  }
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
    .replace(/사진과\s*경험으로\s*만드는\s*더\s*투명한\s*(시장|Markets)\s*정보/g, 'Clearer market information through photos and real experiences')
    .replace(/실제\s*구매한\s*회의\s*상태,\s*가격,\s*상점\s*경험을\s*남겨주세요\.\s*비방이나\s*개인정보가\s*담긴\s*사진은\s*등록하지\s*마세요\./g, 'Share the sashimi condition, price, and shop experience from your purchase. Please do not post abusive content or photos containing personal information.')
    .replace(/(부산|Busan)공동어시장\s*현황/g, 'Busan Cooperative Fish Market overview')
    .replace(/8\/6\s*입항/g, 'Aug 6 arrivals')
    .replace(/8\/5\s*위판/g, 'Aug 5 auction')
    .replace(/전체\s*평균\s*위판단가/g, 'Overall average auction price')
    .replace(/고등어·매가리/g, 'Mackerel · horse mackerel')
    .replace(/잡어/g, 'Mixed fish')
    .replace(/수산물\s*종류\s*검색/g, 'Search seafood types')
    .replace(/수산물\s*시세\s*전체\s*보기/g, 'View all seafood prices')
    .replace(/(\d+)개\s*품목/g, '$1 items')
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
    .replace(/(\d[\d,]*)원/g, '$1 KRW')
    .replace(/(\d+)items/g, '$1 items')
    .replace(/(\d[\d,]*)boxes/g, '$1 boxes')
    .replace(/(\d+)tons/g, '$1 tons');
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
  document.documentElement.lang = language === 'en' ? 'en' : language === 'ja' ? 'ja' : language === 'zh' ? 'zh-CN' : 'ko';
  document.title = language === 'zh'
    ? (location.pathname.includes('커뮤니티') ? '釜山海鲜价格 | 社区' : '釜山海鲜价格 | 水产品行情')
    : language === 'ja'
    ? (location.pathname.includes('커뮤니티') ? '釜山 海の値段 | コミュニティ' : '釜山 海の値段 | 水産物の相場')
    : language === 'en'
    ? (location.pathname.includes('커뮤니티') ? 'Busan Sea Price | Community' : 'Busan Sea Price | Live Seafood Prices')
    : (location.pathname.includes('커뮤니티') ? '부산 바다값 | 회 구매 제보 커뮤니티' : '부산 바다값 | 실시간 수산물 시세');
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(translateTextNode);
  root.querySelectorAll?.('*').forEach(translateAttributes);
  mountPhotoChooser();
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
  select.innerHTML = '<option value="ko">한국어</option><option value="en">English</option><option value="ja">日本語</option><option value="zh">中文</option>';
  select.style.cssText = 'border:1px solid #dbe7eb;background:#fff;border-radius:99px;padding:8px 10px;color:#09283e;font:700 11px Manrope;cursor:pointer';
  select.value = language;
  select.addEventListener('change', async () => { language = select.value; await persistLanguage(); applyLanguage(); });
  const login = document.querySelector('#login');
  if (login) login.before(select);
  else document.querySelector('.head')?.append(select);
}

function mountPhotoChooser() {
  const input = document.querySelector('#photo[type="file"]');
  if (!input) return;
  const existing = document.querySelector('#photoChooser');
  if (existing) { existing._refresh?.(); return; }
  const chooser = document.createElement('label');
  chooser.id = 'photoChooser'; chooser.htmlFor = 'photo'; chooser.dataset.i18nIgnore = 'true';
  chooser.style.cssText = 'display:flex;align-items:center;gap:9px;min-height:42px;padding:0 12px;border:1px solid #d8e5ea;border-radius:10px;color:#173b53;font:700 12px Manrope;cursor:pointer;background:#fff';
  const button = document.createElement('span');
  button.style.cssText = 'padding:7px 10px;border-radius:7px;background:#edf5f7;color:#09283e';
  const name = document.createElement('span'); name.id = 'photoChooserName';
  const update = () => {
    const english = language === 'en';
    const japaneseMode = language === 'ja';
    const chineseMode = language === 'zh';
    button.textContent = english ? 'Choose photo' : japaneseMode ? '写真を選択' : chineseMode ? '选择照片' : '사진 선택';
    name.textContent = input.files?.[0]?.name || (english ? 'No file selected' : japaneseMode ? 'ファイルが選択されていません' : chineseMode ? '未选择文件' : '선택된 파일 없음');
  };
  input.style.display = 'none'; input.after(chooser); chooser.append(button, name); chooser._refresh = update; input.addEventListener('change', update); update();
}

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
    else if (node.nodeType === Node.ELEMENT_NODE) applyLanguage(node);
  }));
});

document.addEventListener('DOMContentLoaded', () => {
  mountLanguageSelect(); mountPhotoChooser(); applyLanguage(); observer.observe(document.body, { childList:true, subtree:true });
});

onUserChanged(async user => {
  if (!user) return;
  try {
    const profile = await loadMyData(user.uid);
    // The language just chosen in this browser must win over an older profile value.
    // Otherwise moving to another page can briefly reset Chinese/Japanese back to Korean.
    const browserLanguage = localStorage.getItem(languageKey);
    const supported = ['ko', 'en', 'ja', 'zh'];
    if (supported.includes(browserLanguage)) {
      language = browserLanguage;
      applyLanguage();
      if (profile.language !== browserLanguage) await saveMyData(user.uid, { language: browserLanguage });
    } else if (supported.includes(profile.language)) {
      language = profile.language;
      localStorage.setItem(languageKey, language);
      applyLanguage();
    }
  } catch (_) {}
});
