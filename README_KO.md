# Picklary v1.1.0 시작 안내

기존 자가진단과 웹 편집기를 v1.0 디자인에 복원한 소스입니다. **Vision 분석 프로그램과 Windows 앱 ZIP은 별도로 필요합니다.**

1. 압축을 풀고 `package.json`, `netlify.toml`, `data/`, `public/`, `scripts/`, `templates/`, `.github/`를 GitHub 저장소 최상위에 올리세요.
2. Netlify: Build `npm run check`, Publish `dist`, Node `22`, Base는 비워 둠니다.
3. 기존 사이트를 바로 덮지 말고 Preview에서 확인하세요.

로컬 확인:
```sh
npm ci --ignore-scripts
npm run check
npm run serve
```

`http://127.0.0.1:8080/ko/`에서 확인합니다. HTML을 더블클릭해서 열지 마세요.

## 영상 추출

재생는 로컬으로 즉시 처리하며, 추출 시 FFmpeg 엔진을 별도로 불러옵니다. 엔진을 미리 포함하려면 네트워크가 되는 환경에서 `npm run engine:cache` 후 다시 빌드하세요.

GitHub Actions의 `Optional real browser export and engine package`를 수동 실행하면 실제 브라우저 추출을 검사하는 흐름을 제공합니다. 이번 작업 환경에서 해당 워크플로우를 실행한 것은 아닙니다.

## 빠진 프로그램 연결

실제 전체 ZIP을 검토한 뒤 등록합니다:
```sh
npm run release:register -- --id vision-ko --file /path/to/Vision_KO.zip --version 0.2.4 --reviewed
npm run release:register -- --id windows-editor --file /path/to/Windows.zip --version 0.9.8 --reviewed
npm run check
```

영문 Vision은 `--id vision-en`을 사용합니다. 실제 파일과 해시가 맞을 때만 다운로드 버튼이 나타납니다.

복원 내역과 제한사항은 `docs/RELEASE_AUDIT.md`, 상세 실행방법은 `README.md`를 확인하세요.
