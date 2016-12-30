# palecore

> Markup builder to start new project with BEM

## Команды

```sh
npm start       # Запуск сборки, вотчеров, сервера

npm run build   # Сборка на продакшн
```

## Структура проекта

```sh
/blocks/    # Блоки (js, css, post.css jpg, png, svg)
/bundles/   # Бандлы (bemdecl.js)
/pages/     # Страницы (nunjucks, html)
/templates/ # Шаблоны (nunjucks, html)
```

## Порядок сборки

1. Всё лежит только в блоках.

2. Основной уровень `/blocks/`.

3. Варианты уровней:
```sh
/desktop.blocks/
/touch.blocks/
/design/blocks/
/design/desktop.blocks/
/design/touch.blocks/
```

4. Блоки собираются по декларациям, которые лежат в `/bundles/` и кладутся в `/dist/`.

5. Стили:
  а) проходят через postcss,
  б) автопрефиксер,
  г) склеиваются,
  д) сжимаются,
  е) копируются в `/dist/{delcName}/{delcName}.css`.

6. Скрипты:
  а) склеиваются,
  б) сжимаются,
  d) копируются в `/dist/{delcName}/{delcName}.js`.

7. Картинки, которые указаны в зависимостях блока:
  а) сжимаются (кеш для оптимизации),
  б) убираются относительные пути,
  в) копируются в `/dist/{delcName}/images/`.

8. Если картинка, которую надо вставить в `background-image` весит больше 14 Кбайт, то вставлять ее в HTML, и указать в зависимостях:
```js
[{
  shouldDeps: [
    { elems: ['image'] }
  ]
}];
```
