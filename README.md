# Picklary 1.0.0 — GitHub 업로드용 소스

**기준일: 2026-10-04 · 영어/한국어 · 정적 사이트 · 광고 게재 OFF**

기존 v0.8.4를 그대로 꾸민 버전이 아니라, 사실·이미지 연결과 콘텐츠 구조를 다시 정리한 재설계본입니다. 이 저장소에는 재빌드 가능한 소스, 검사 도구, Netlify 설정, GitHub Actions, 변경 기록이 들어 있습니다.

**기술 검증 통과와 AdSense 승인 가능 판정은 다릅니다.** 실제 Google 거절 사유는 확보되지 않았으며 승인 여부는 Google이 결정합니다. 게시 전 확인 사항은 [PUBLICATION_CHECKLIST.md](docs/PUBLICATION_CHECKLIST.md)를 읽어 주세요.

## 1. GitHub에 올릴 것

ZIP을 풀었을 때 이 `README.md`와 같은 위치에 있는 파일·폴더를 저장소 루트에 넣으세요.

```text
.github/workflows/         자동 빌드 검사 / 수동 이미지 패키징
data/                     콘텐츠·결과·출처·이미지 등록부
public/assets/            CSS·브라우저 JavaScript·로컬 이미지
scripts/                  빌드·정적 검사·배포 후 검사
docs/                     감사 결과·게시 체크리스트·이전 URL 대응
legacy/                   보존한 구버전 자료 (공개 빌드 제외)
package.json
package-lock.json
netlify.toml
.nvmrc
```

ZIP 파일 하나를 저장소에 올리는 방식이 아니라 **압축을 해제한 내용을 업로드**합니다. `.github`, `.gitignore`, `.nvmrc` 같은 점으로 시작하는 항목도 포함하세요. `dist/`, `node_modules/`, `test-results/`는 Git에 올리지 않습니다. 파일이 많을 때는 GitHub Desktop 또는 Git으로 폴더를 커밋하면 누락을 줄일 수 있습니다.

기존 저장소를 바로 덮기보다 **새 브랜치 또는 별도 저장소로 먼저 Preview 배포**하세요. 기존 URL 399개의 처리 상태를 `docs/MIGRATION_INVENTORY.csv`에 기록했습니다.

## 2. 로컬 실행

Node.js 22 이상이 필요합니다. 실행 시 제3자 Node 패키지를 다운로드할 필요가 없는 구조입니다.

```bash
npm ci --ignore-scripts
npm run check
npm run serve
```

브라우저에서 `http://127.0.0.1:8080/en/` 또는 `/ko/`를 엽니다.

`npm run check`는 빌드 후 내부 경로, 앵커, 사이트맵, 메타데이터, 구조화 데이터, 결과 데이터의 형태, 이미지 등록부, 광고 스크립트 부재를 검사합니다. **실제 사람·제품의 식별, 사진 이용권, 외부 URL의 현재 응답, Google 심사는 이 명령의 검증 범위가 아닙니다.**

## 3. Netlify 연결

GitHub 저장소를 Netlify의 새 프로젝트/사이트로 연결합니다. 설정은 `netlify.toml`에 포함되어 있습니다.

| 항목 | 값 |
|---|---|
| Base directory | 비워 두기 (저장소 루트) |
| Build command | `npm run check` |
| Publish directory | `dist` |
| Node version | `22` |

빌드 실패 시 오류를 해결한 후 배포합니다. 소스 루트 전체를 공개하지 않습니다. `data/`, `legacy/`, `scripts/`는 `dist/`에 복사되지 않습니다.

동봉한 별도 **NETLIFY_PREVIEW.zip**은 이미 생성된 정적 파일입니다. 압축을 풀어 `index.html`, `_redirects`, `_headers`, `assets/`, `en/`, `ko/`가 바로 보이는 폴더를 수동 배포할 때 사용할 수 있습니다.

기본 도메인은 `https://picklary.com`입니다. 실제 운영 도메인을 바꾸면 `data/site.json`의 `url`을 수정하고 다시 빌드해야 canonical·hreflang·사이트맵이 맞습니다.

## 4. 무엇이 달라졌나

- 9개의 실전 가이드를 영어·한국어로 다시 작성했습니다. 판단 조건, 연습 과제, 검토 질문을 포함합니다.
- 제품 28개를 5종류로 나누고 브랜드 검색·필터·최대 3개 비교를 제공합니다. 근거 없는 숫자 별점과 가격은 넣지 않았습니다.
- 선수 20명(프로 19명 + 주니어 Ella Oh)을 정확한 출처와 연결했습니다. 주니어를 세계 Top 10 선수로 표시하지 않습니다.
- 애리조나·쿠알라룸푸르·라스베이거스·MLP 결승 기록을 분리했습니다. 일부 미확인 결과는 그대로 표시합니다.
- PPA 종합 WPR과 독립 PickleWave 종목별 Elo를 별도 표로 구분합니다. Elo를 공식 세계랭킹이나 DUPR라고 부르지 않습니다.
- 로컬 영상 재생·랠리 타임스탬프·노트·CSV/JSON 내보내기 도구를 제공합니다. 서버 업로드는 없습니다.
- 검증되지 않은 AI 레이팅, 가짜 커뮤니티 글, 빈 다운로드, 반복 문단을 공개 빌드에서 뺐습니다.
- 해시가 붙은 CSS/JS 파일을 생성해 이전의 같은 파일명 장기 캐시 문제를 줄였습니다.

## 5. 중요한 범위 변경

**기존 Clip Lite의 MP4 편집·렌더링, DualCam/AI 레이팅을 이번 공개 빌드가 대체 구현한 것은 아닙니다.** 새 도구는 영상 분석 *노트*를 내보냅니다. 기존 브라우저 편집기 소스는 `legacy/clip-lite-web/`에 남겨 두었고 공개하지 않습니다. 관련 옛 URL은 새 분석 도구로 임시 302 연결됩니다. 기존 기능을 계속 운영해야 한다면 별도 테스트 후 기존 앱 경로를 유지하도록 배포 전에 조정하세요.

원문 자료도 `legacy/content-v084/`에 보존했습니다. 사진 연결과 수치 문제가 있는 자료이므로 검토 없이 다시 배포하지 않습니다. 페이지 수를 줄인 것 자체가 승인 요건은 아니며, 이는 중복·미검증 페이지를 정리하기 위한 편집 선택입니다.

## 6. 실제 이미지와 이용권

48개 이미지 등록부 중 **17개는 로컬 WebP**, **31개는 공식 출처의 외부 이미지 URL**입니다. 다른 제품 사진으로 빈자리를 채우지 않습니다. 외부 이미지가 실패하면 해당 사실과 대상명을 표시합니다.

**공식 페이지에서 가져왔다는 사실은 재사용 허가가 아닙니다.** 이번 작업에서 개별 이용권까지 취득하지는 않았습니다. [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)와 `docs/MEDIA_RIGHTS_CHECKLIST.csv`에서 운영자가 출처와 이용 근거를 확인해야 합니다.

권리를 확인한 뒤 이미지까지 저장소에 넣으려면, 네트워크가 되는 환경에서:

```bash
npm run media:cache -- --rights-reviewed
npm run check
```

`public/assets/media/`와 `data/media-cache.json`을 함께 커밋하세요. 또는 GitHub Actions의 **Package reviewed media (manual)**을 실행해 결과 아티팩트를 검토할 수 있습니다. 체크박스는 법적 허가를 대신하지 않습니다. 이 워크플로는 저장소에 자동 커밋하지 않습니다.

## 7. 배포 후 확인

```bash
npm run check:live -- https://picklary.com --images
```

실제 사이트의 루트 리다이렉트, 핵심 페이지, 404, `ads.txt`, `robots.txt`, 사이트맵 및 이미지 응답을 확인합니다. Preview 주소를 먼저 넣어서 실행해도 됩니다. 제작 환경에서는 외부 이미지 응답을 브라우저로 일괄 확인할 수 없었으므로 이 단계가 필요합니다.

## 8. AdSense

- 게시자 ID: `ca-pub-3524565373895748` — 기존 설정을 유지했습니다. 계정의 실제 ID와 대조하세요.
- 소유 확인 메타태그와 `ads.txt`는 있습니다.
- **광고 요청 스크립트는 없습니다.** `adServingEnabled`는 false로 유지하세요.
- 개인정보·문의·편집 원칙은 실제 현재 기능(이메일, 호스팅 로그, 외부 이미지 요청, 선택적 로컬 저장)에 맞춰 다시 작성했습니다.
- 재검토 요청 전 실제 거절 문구, 사진 이용권, 운영자 최종 내용 검토, 운영 도메인 접근, 검색엔진 접근을 확인하세요.
- 향후 광고를 켤 때는 별도의 동의/CMP·광고 위치·정책 검토가 필요합니다. 단순히 설정 하나를 true로 바꾸는 구현은 제공하지 않습니다.

Google 공식 기준: [사이트 준비](https://support.google.com/adsense/answer/7299563), [복제 콘텐츠](https://support.google.com/publisherpolicies/answer/11190248), [ads.txt](https://support.google.com/adsense/answer/12171612).

## 9. 수정할 위치

| 수정 대상 | 파일 |
|---|---|
| 글 | `data/guides.json` |
| 제품/선수 | `data/products.json`, `data/players.json` |
| 경기 결과 | `data/results.json` |
| 대회 일정 | `data/schedule.json` |
| 랭킹 | `data/rankings.json` |
| 출처와 확인일 | `data/sources.json` |
| 사진의 실제 대상/URL/권리 상태 | `data/media.json` |
| 개인정보·정정 내역 | `data/policies.json` |
| 이전 URL 대응 | `data/redirects.json` |

[콘텐츠 업데이트 안내](docs/CONTENT_UPDATES.md)와 [검사 범위](docs/TEST_SCOPE.md)를 함께 읽어 주세요.
