[![fair compare logo](https://cdn.jsdelivr.net/gh/catdad-experiments/catdad-experiments-org@7cb300/fair-compare/logo.jpg)](https://github.com/catdad/fair-compare/#readme)

<p align="center"><b>You know... it's just okay</b></p>

> Simple and easy comparison of images and text across whole directories, with no confusing frills

## Download

Download and install the latest version for your operating system from the [latest release][release].

[![Windows installer](https://img.shields.io/badge/Windows-installer-20b2dc?style=for-the-badge&logo=windows)][release]

[![Windows portable](https://img.shields.io/badge/Windows-portable-238636?style=for-the-badge&logo=windows)][release]

[![MacOS dmg](https://img.shields.io/badge/MacOS-dmg-798083?style=for-the-badge&logo=apple)][release]

[![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-de681b?style=for-the-badge&logo=linux&logoColor=white)][release]

[release]: https://github.com/catdad/fair-compare/releases/latest

### Support Notes

#### Windows

These executables are not signed, so in any prompts where Windows would generally show developer information, it will warn you that this app is not signed. This should not prevent its usage however. Signing Windows applications is a bit expensive for an open-source application. If this is important to you, please consider sponsoring me and this project.

#### MacOS

The dmg package is not signed or notorized, so MacOS will warn you that this application is made by an untrusted developer. You will need to trust this application in order to run it. In most cases, you will just see a prompt telling you what to do when you try to run the application for the first time. However, if you do not, it would be best to search how to do this on your specific OS version since Apple keeps changing the process for doing this with every OS update for some reason. Becoming a trusted developer is quite expensive for an open-source application. If this is important to you, please consider sponsoring me and this project.

### Issues

If you experience an issue or have an idea for new improvements or features, please [create a bug](https://github.com/catdad/fair-compare/issues/new) or reach out to me on [twitter @kirilv](https://twitter.com/kirilv).

## Development

This project requires a recent version of [node](https://nodejs.org/). In order to set it up:

```bash
git clone git@github.com:catdad/fair-compare.git
cd fair-compare
npm install
```

After that, to launch the app:

```bash
npm start
```

If you are going to be doing a lot of development and would like the app to reload/restart automatically as you change code:

```bash
npm run dev
```
