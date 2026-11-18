# URL 변환과 LLM 내보내기

## Decisions

- 본문 추출은 `defuddle` 라이브러리(`defuddle/node` + `linkedom`)를 쓰고, 서버(`POST /api/convert`)에서 수행합니다. `markdown: true` 옵션에서는 Markdown이 `content`에 담깁니다.
- 호스팅 API(`defuddle.md`)는 쓰지 않습니다.
- ChatGPT·Claude로 열 때 프롬프트+본문이 6000자 이하면 `?q=` 쿼리로 직접 전달합니다. 넘으면 클립보드에 복사하고 빈 새 대화를 열어 붙여넣기를 안내합니다. 본문은 자르지 않습니다.
- 프롬프트는 열기에만 붙고 복사·다운로드에는 붙지 않습니다. 직접 입력한 프롬프트는 저장하지 않습니다.

## Boundaries

- 서버 측 보안 하드닝(사설 IP 차단 등)과 속도 제한은 학습용 프로젝트의 범위 예산에 따라 하지 않습니다.

## Why

브라우저에서 임의 사이트를 가져오면 CORS로 막혀 서버 변환이 필요합니다. 호스팅 API는 요청 한도가 있고 라이브러리 필수 요구와도 맞지 않습니다. 긴 본문은 URL 길이 한도에 걸려 잘리므로 클립보드 경로로 떨어뜨립니다.

## Reconsider when

- ChatGPT·Claude의 `?q=` 동작이나 길이 한도가 바뀌어 직접 전달이 깨질 때
