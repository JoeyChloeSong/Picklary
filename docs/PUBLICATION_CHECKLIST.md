# 게시 및 AdSense 재검토 전 확인표

기술 검사 PASS를 Google의 승인 또는 법적 이용 허가로 해석하지 마세요.

## 먼저 Preview에서 확인
- [ ] 실제 AdSense 거절 문구와 해당 사이트 주소를 확인했습니다. 이번 작업에서는 계정의 상세 거절 사유를 확보하지 못했습니다.
- [ ] `README.md`의 기능 축소와 `MIGRATION_INVENTORY.csv`를 검토했습니다.
- [ ] 기존 Clip Lite/영상 내보내기를 운영해야 하는지 결정했습니다. 새 영상 도구의 출력은 CSV/JSON 노트이지 MP4가 아닙니다.
- [ ] 9개 영문·국문 가이드를 운영자가 직접 읽고 확인했습니다. 직접 테스트하지 않은 제품을 실측 리뷰로 표현하지 않습니다.
- [ ] 48개 사진의 이름/모델/색상·제품군 표시를 대조하고 사용 근거를 기록했습니다.
- [ ] 원본 사진 사용권·상업 이용권은 `THIRD_PARTY_NOTICES.md`에 따라 검토했습니다.
- [ ] 외부 이미지 31개의 응답과 화면 표시를 확인하거나 권리 확인 후 로컬 패키징했습니다.
- [ ] 휴대전화에서 메뉴, 필터, 비교, 결과표, 문의 이메일을 확인했습니다.
- [ ] 프로 선수와 주니어, PPA WPR과 독립 Elo가 서로 구분되어 있습니다.
- [ ] 라스베이거스의 나머지 결승과 쿠알라룸푸르 남복 점수는 확인 후에만 갱신합니다.

## 운영 도메인 배포 후
- [ ] 소유 도메인 `https://picklary.com`에 새 빌드가 실제로 배포되었습니다.
- [ ] 외부 방문자가 비밀번호·로그인·지역 제한 없이 핵심 콘텐츠를 읽을 수 있습니다.
- [ ] `npm run check:live -- https://picklary.com --images`의 실패 항목을 해결했습니다.
- [ ] 루트는 /en/로 이동하며, 없는 주소는 실제 404를 반환합니다.
- [ ] `ads.txt`의 게시자 ID가 본인 AdSense 계정과 일치합니다.
- [ ] Search Console의 Sitemaps 메뉴에 `/sitemap.xml`을 제출했습니다. 사이트맵 파일 자체를 일반 페이지처럼 색인 요청하지 않습니다.
- [ ] 핵심 URL을 검사하고 중복 canonical, 리다이렉트 루프, 실수로 넣은 noindex가 없는지 확인했습니다.
- [ ] 이전 Netlify Forms 제출 내역이 있는지 확인하고 보관·삭제·문의 대응을 별도로 정리했습니다. 코드 교체는 서버의 과거 제출 데이터를 삭제하지 않습니다.
- [ ] 위 사항을 완료한 뒤 AdSense 사이트 화면에서 재검토를 요청합니다.

## 광고를 실제로 켜기 전
- [ ] 광고 코드·위치·오류 페이지 제외·사용자 동의를 별도로 검토했습니다.
- [ ] 필요한 지역에서는 Google의 동의/CMP 요구사항을 적용했습니다.
- [ ] 개인정보 고지를 실제 광고/분석 기술의 동작에 맞게 갱신했습니다.
- [ ] 광고와 편집 콘텐츠/상업 관계를 명확히 구분했습니다.

Google 공식 안내:
- 사이트 준비: https://support.google.com/adsense/answer/7299563
- 복제 콘텐츠 및 부가가치: https://support.google.com/publisherpolicies/answer/11190248
- 사이트 연결/소유 확인: https://support.google.com/adsense/answer/7584263
- ads.txt: https://support.google.com/adsense/answer/12171612
- Google 동의 관리 요구사항: https://support.google.com/adsense/answer/13554116
