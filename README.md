# palecore
> Markup builder to start new project with BEM

[![GitHub Release](https://img.shields.io/github/release/palegrow/palecore.svg?style=flat)](https://github.com/palegrow/palecore/releases)
![dependencies](https://david-dm.org/palegrow/palecore.svg)

## Install
```sh
git clone https://github.com/palegrow/palecore.git new-project
cd new-project
npm install
```

## Usage
Basic developer usage
```sh
export PATH=./node_modules/.bin:$PATH
export NODE_ENV=development
npm start # gulp
```

Production
```sh
NODE_ENV=production gulp
```
or just build `dist` without run server
```sh
npm run build # NODE_ENV=production gulp build
```

## Работа с картинками и другими сопутсвующими файлами

Все картинки (файлы шрифтов и пр.), которые прописаны в CSS в свойстве `url()`, не нуждаются в дополнительном объявлении.

Картинки же, которые вставляются тегом `img` в HTML, надо добавлять в зависимости (deps.js).

В ситуации, когда картинка названа также как и блок, и вставляется с помощью `url()`, она задвоится - будет заинлайнена в итоговом CSS и лежать в папке бандла.

Если для фона будут использоваться большие картинки (~2 Мб и больше), то CSSO может выпасть с ошибкой.
