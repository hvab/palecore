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
