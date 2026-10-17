/**
 * ============================================================================
 * [script.js] - 모바일 명함 스마트 자동 연동 엔진
 * ============================================================================
 * - 명함설정.js의 데이터를 바탕으로 모든 버튼과 링크를 자동으로 완성합니다.
 * - 카카오톡 인앱 브라우저 호환성 및 vCard 실시간 생성 다운로드를 완벽 지원합니다.
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. 명함 데이터 검증 및 화면 자동 바인딩
  if (typeof CARD_DATA === "undefined") {
    console.error("명함설정.js 파일이 로드되지 않았습니다.");
    return;
  }

  // 특수문자 제거된 순수 전화번호 (01012345678)
  const cleanPhone = CARD_DATA.phone.replace(/[^0-9]/g, "");

  // 2. 화면 각 요소에 데이터 자동 주입
  applyCardData(cleanPhone);

  // 3. 기능 초기화
  initTouchCall(cleanPhone);
  initAutoCallParam(cleanPhone);
  initAddressFeatures();
  initNaverMapLink();
  initVcardDownload(cleanPhone);
  initShareFeatures(cleanPhone);
});

/**
 * [1] 명함설정.js의 데이터를 HTML 요소들에 자동 주입하고 없는 항목은 숨김 처리
 */
function applyCardData(cleanPhone) {
  // 타이틀 및 헤더
  document.getElementById("pageTitle").textContent = `${CARD_DATA.company} ${CARD_DATA.name} ${CARD_DATA.title} - 공식 모바일 명함`;
  document.getElementById("headerCompany").textContent = CARD_DATA.company || "공식 모바일 명함";
  document.getElementById("headerName").textContent = CARD_DATA.name;
  document.getElementById("headerTitle").textContent = CARD_DATA.title;

  // 오픈그래프 메타 태그 업데이트
  const ogTitle = document.getElementById("ogTitle");
  if (ogTitle) ogTitle.content = `${CARD_DATA.company} | ${CARD_DATA.name} ${CARD_DATA.title}`;

  // 상단 터치 안내 배너 전화번호
  document.getElementById("noticePhone").textContent = `${CARD_DATA.phone}로 바로 전화 연결`;

  // 빠른 연락 버튼 (전화/문자)
  const btnCallMain = document.getElementById("btnCallMain");
  btnCallMain.href = `tel:${cleanPhone}`;
  document.getElementById("btnPhoneValue").textContent = CARD_DATA.phone;

  const btnSms = document.getElementById("btnSms");
  btnSms.href = `sms:${cleanPhone}`;

  // 하단 고정 플로팅 전화 상담 바
  document.getElementById("floatingName").textContent = `${CARD_DATA.name} ${CARD_DATA.title}`;
  document.getElementById("floatingCallBtn").href = `tel:${cleanPhone}`;

  // 주요 채널 섹션 제목 (주소 유무에 따라 최적화)
  const sectionTitle = document.querySelector(".section-title");
  if (sectionTitle) {
    sectionTitle.textContent = (CARD_DATA.address && CARD_DATA.address.trim() !== "")
      ? "주요 채널 및 오시는 길"
      : "주요 채널 및 공식 안내";
  }

  // 주소 및 위치 (주소가 없으면 스마트 자동 숨김)
  const btnCopyAddress = document.getElementById("btnCopyAddress");
  const btnNaverMap = document.getElementById("btnNaverMap");
  if (CARD_DATA.address && CARD_DATA.address.trim() !== "") {
    document.getElementById("lblLocationTitle").textContent = CARD_DATA.locationTitle || "사무실 위치";
    document.getElementById("lblAddressText").textContent = `${CARD_DATA.address} (터치 시 주소 복사)`;
    document.getElementById("lblMapDesc").textContent = `${CARD_DATA.address} 위치 및 길찾기`;
  } else {
    if (btnCopyAddress) btnCopyAddress.style.display = "none";
    if (btnNaverMap) btnNaverMap.style.display = "none";
  }

  // 선택 링크 항목 스마트 자동 연결 및 숨김 처리
  setupOptionalLink("itemWebsite", CARD_DATA.websiteUrl, "lblWebsiteDesc", CARD_DATA.websiteDesc);
  setupOptionalLink("itemOpenKakao", CARD_DATA.openKakaoUrl, "lblOpenKakaoDesc", CARD_DATA.openKakaoDesc);
  setupOptionalLink("itemBlog", CARD_DATA.blogUrl, "lblBlogDesc", CARD_DATA.blogDesc);
  setupOptionalLink("itemYoutube", CARD_DATA.youtubeUrl, "lblYoutubeDesc", CARD_DATA.youtubeDesc);

  // 이메일 항목
  const itemEmail = document.getElementById("itemEmail");
  if (CARD_DATA.email && CARD_DATA.email.trim() !== "") {
    itemEmail.href = `mailto:${CARD_DATA.email}`;
    document.getElementById("lblEmailText").textContent = CARD_DATA.email;
  } else {
    itemEmail.style.display = "none";
  }
}

/**
 * 선택 링크 도우미: URL이 없으면 버튼 자체를 숨김(display: none)
 */
function setupOptionalLink(elementId, url, descElementId, descText) {
  const element = document.getElementById(elementId);
  if (!element) return;

  if (url && url.trim() !== "") {
    element.href = url;
    if (descElementId && descText) {
      const descEl = document.getElementById(descElementId);
      if (descEl) descEl.textContent = descText;
    }
  } else {
    element.style.display = "none";
  }
}

/**
 * [2] 명함 이미지 터치 시 즉시 전화 다이얼 연결
 */
function initTouchCall(cleanPhone) {
  const cardTouchArea = document.getElementById("cardTouchArea");
  if (!cardTouchArea) return;

  cardTouchArea.href = `tel:${cleanPhone}`;

  cardTouchArea.addEventListener("click", () => {
    showToast(`📞 ${CARD_DATA.phone} 로 전화 연결합니다...`);
  });
}

/**
 * [3] URL에 ?call=1 파라미터가 있을 때 페이지 진입 즉시 전화 다이얼 팝업
 */
function initAutoCallParam(cleanPhone) {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("call") === "1") {
    setTimeout(() => {
      window.location.href = `tel:${cleanPhone}`;
    }, 600);
  }
}

/**
 * [4] 주소 복사 기능 (터치 시 원터치 클립보드 복사)
 */
function initAddressFeatures() {
  const btnCopyAddress = document.getElementById("btnCopyAddress");
  if (!btnCopyAddress || !CARD_DATA.address || CARD_DATA.address.trim() === "") return;

  btnCopyAddress.addEventListener("click", async () => {
    const success = await copyTextToClipboard(CARD_DATA.address);
    if (success) {
      showToast("📍 주소가 복사되었습니다! (내비 앱에 붙여넣기)");
    } else {
      showToast(`📍 주소: ${CARD_DATA.address}`);
    }
  });
}

/**
 * [5] [핵심] 네이버 지도 길찾기 연동 (카카오톡 인앱 브라우저 완벽 대응)
 */
function initNaverMapLink() {
  const btnNaverMap = document.getElementById("btnNaverMap");
  if (!btnNaverMap || !CARD_DATA.address) return;

  // 네이버 지도 통합 검색 및 길찾기 URL 생성
  const encodedAddress = encodeURIComponent(CARD_DATA.address);
  const naverMapUrl = `https://map.naver.com/v5/search/${encodedAddress}`;
  btnNaverMap.href = naverMapUrl;

  // 카카오톡 인앱 브라우저인지 확인
  const isKakaoTalk = /KAKAOTALK/i.test(navigator.userAgent);

  btnNaverMap.addEventListener("click", (e) => {
    if (isKakaoTalk) {
      e.preventDefault();
      // 카카오톡 내에서 외부 브라우저(크롬, 사파리, 네이버 지도 앱)로 안전하게 호출
      window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(naverMapUrl)}`;
    }
  });
}

/**
 * [6] vCard 스마트폰 연락처 실시간 생성 및 자동 다운로드
 */
function initVcardDownload(cleanPhone) {
  const btnSaveContact = document.getElementById("btnSaveContact");
  if (!btnSaveContact) return;

  btnSaveContact.addEventListener("click", () => {
    try {
      // vCard 3.0 표준 포맷 구성
      const vcardContent = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${CARD_DATA.name};;;;`,
        `FN:${CARD_DATA.name} (${CARD_DATA.company})`,
        `ORG:${CARD_DATA.company};`,
        `TITLE:${CARD_DATA.title}`,
        `TEL;TYPE=CELL;TYPE=VOICE;TYPE=pref:${CARD_DATA.phone}`,
        CARD_DATA.email ? `EMAIL;TYPE=INTERNET;TYPE=WORK:${CARD_DATA.email}` : "",
        CARD_DATA.address ? `ADR;TYPE=WORK:;;${CARD_DATA.address};;;;` : "",
        CARD_DATA.websiteUrl ? `URL;TYPE=WORK:${CARD_DATA.websiteUrl}` : "",
        `NOTE:${CARD_DATA.company} 공식 모바일 명함`,
        "END:VCARD"
      ].filter(line => line !== "").join("\r\n");

      // UTF-8 인코딩 Blob 객체 생성
      const blob = new Blob([vcardContent], { type: "text/vcard;charset=utf-8;" });
      const downloadUrl = URL.createObjectURL(blob);

      // 가상 링크를 통해 다운로드 트리거
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = `${CARD_DATA.name}_연락처.vcf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);

      showToast("👤 연락처(vCard) 파일이 다운로드되었습니다!");
    } catch (err) {
      showToast(`📞 전화번호: ${CARD_DATA.phone}`);
    }
  });
}

/**
 * [7] 명함 공유하기 (카카오톡 및 링크 복사)
 */
function initShareFeatures(cleanPhone) {
  const btnShareKakao = document.getElementById("btnShareKakao");
  const btnShareLink = document.getElementById("btnShareLink");

  // 대표 공유 URL 계산
  const currentUrl = window.location.href.split("?")[0];
  const targetShareUrl = (CARD_DATA.shareUrl && CARD_DATA.shareUrl.trim() !== "")
    ? CARD_DATA.shareUrl
    : currentUrl;

  // 카카오톡 카드를 누르면 웹이 열리면서 즉시 전화 다이얼이 열리도록 ?call=1 파라미터 적용
  const callShareUrl = targetShareUrl.includes("?") ? `${targetShareUrl}&call=1` : `${targetShareUrl}?call=1`;

  // 1. 카톡으로 받기 & 지인 전달
  if (btnShareKakao) {
    btnShareKakao.addEventListener("click", async () => {
      // 모바일 웹 공유 API가 지원되는 최신 브라우저인 경우 네이티브 공유창 호출
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${CARD_DATA.company} ${CARD_DATA.name} 모바일 명함`,
            text: `[${CARD_DATA.company}] ${CARD_DATA.name} ${CARD_DATA.title} 공식 명함입니다. (터치 시 통화 연결)`,
            url: callShareUrl
          });
          return;
        } catch (e) {
          // 사용자가 취소한 경우 무시
        }
      }

      // 공유 API 미지원 시 전화 연결 링크 클립보드 복사
      await copyTextToClipboard(callShareUrl);
      showToast("💬 전화 바로연결 명함 주소가 복사되었습니다! 카톡에 붙여넣기 하세요.");
    });
  }

  // 2. 명함 인터넷 웹 주소 복사
  if (btnShareLink) {
    btnShareLink.addEventListener("click", async () => {
      await copyTextToClipboard(callShareUrl);
      showToast("🔗 전화 바로연결 명함 주소가 복사되었습니다!");
    });
  }
}

/**
 * [공통 유틸] 클립보드 복사 함수 (신/구형 브라우저 완벽 대응)
 */
async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // 구형 브라우저 대응
    const tempInput = document.createElement("textarea");
    tempInput.value = text;
    tempInput.style.position = "fixed";
    tempInput.style.opacity = "0";
    document.body.appendChild(tempInput);
    tempInput.select();
    const success = document.execCommand("copy");
    document.body.removeChild(tempInput);
    return success;
  } catch (err) {
    return false;
  }
}

/**
 * [공통 유틸] 화면 상단 토스트 알림 팝업 메시지
 */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toastPopup");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}
