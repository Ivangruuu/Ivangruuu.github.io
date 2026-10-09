# Иван Груздев — ML Engineer

Сайт-резюме с кейсами Computer Vision, LLM и VLM. Статический HTML, CSS и JavaScript, пять видеодемонстраций, фотография и PDF-резюме.

## Публикация в аккаунте Ivangruuu

1. Использовать публичный репозиторий `Ivangruuu/Ivangruuu.github.io`.
2. Загрузить содержимое этой папки в ветку `main`, включая `.github/workflows/pages.yml`.
3. В репозитории открыть **Settings → Pages → Build and deployment → Source** и выбрать **GitHub Actions**.
4. В **Actions → Deploy resume to GitHub Pages** запустить **Run workflow**, если первая публикация не стартовала автоматически.
5. Дождаться успешного завершения. Адрес опубликованного сайта появится в **Settings → Pages** и в результате workflow.

Адрес сайта после успешной публикации: https://ivangruuu.github.io/.

При последующих изменениях файлов в `dist` публикация запускается автоматически после push в `main`.

## Локальное обновление сборки

Рабочий исходник сайта находится в соседней папке `ivan-resume`. После его изменения запустить из неё:

```powershell
node scripts/prepare-github-pages.mjs
```

Скрипт обновляет папку `dist` здесь, копируя только используемые сайтом материалы. Исходные цвета видео сохраняются.

## Справка

[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) · [Публикация через GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
