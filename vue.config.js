/**
 * @description     vue.config.js 编译设置，
 * 配置chainWebpack，electron 相关配置以及electron相关插件配置等在pluginOptions
 * see
 * https://blog.csdn.net/qq_40412456/article/details/109593625
 * https://github.com/womade/MusicFun/blob/0795f0c27868bf88bfa9bb9f649d10c62e43c126/vue.config.js
 * @author          Beats0(https://github.com/Beats0)
 * @date            2021-05-09 21:57:51
 */

const path = require("path");

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  devServer: {
    port: 9081,
  },
  chainWebpack(config) {
    // img
    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap(options => Object.assign(options, { limit: 2000, esModule: false })); // 配置线上图片转base64。 app 已有做浏览器缓存。转换过大，会加大首屏加载时长
    // svg
    config.module.rules.delete("svg");
    config.module.rule("svg").exclude.add(resolve("src/icons")).end();
    config.module
      .rule("icons")
      .test(/\.svg$/)
      .include.add(resolve("src/icons"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]",
      })
      .end();
  },
  pluginOptions: {
    // vue-cli-plugin-electron-builder 配置
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        // 设置打包之后的应用名称
        productName: '轻舟',
        appId: 'org.task-pc.electron-vue',
        publish: [
          {
            "provider": "generic",
            "url": process.env.VUE_APP_PUBLISH_URL
          }
        ],
        win: {
          icon: "public/electron-icon/icon.ico",
          // 这里会签名，不要添加 publisherName
          // publisherName: "轻舟",
          // 图标路径 windows系统中icon需要256*256的ico格式图片，更换应用图标亦在此处
          target: [{
            // 打包成一个独立的 exe 安装程序
            target: 'nsis',
            // 这个意思是打出来32 bit + 64 bit的包，但是要注意：这样打包出来的安装包体积比较大
            arch: [
              'x64'
              // 'ia32'
            ]
          }]
        },
        dmg: {
          contents: [
            {
              x: 410,
              y: 150,
              type: 'link',
              path: '/Applications'
            },
            {
              x: 130,
              y: 150,
              type: 'file'
            }
          ]
        },
        linux: {
          // 设置linux的图标
          icon: 'resources/ico/icon.png',
          target: 'AppImage'
        },
        mac: {
          icon: 'resources/ico/icon.icns'
        },
        files: ['**/*'],
        extraResources: [
          // 截图插件路径
          {
            "from": "./qqScreenshot/PrintScr.exe", // 文件源路径
            "to": "./extraResources/PrintScr.exe" // 打包后要放的路径
          },
          {
            "from": "./qqScreenshot/PrScrn.dll",
            "to": "./extraResources/PrScrn.dll"
          },
          {
            // 拷贝dll等静态文件到指定位置,否则打包之后回出现找不大dll的问题
            from: 'resources/',
            to: './'
          }
        ],
        asar: false,
        nsis: {
          // 增加卸载时清除用户数据的配置
          deleteAppDataOnUninstall: true,
          // 是否一键安装，建议为 false，可以让用户点击下一步、下一步、下一步的形式安装程序，如果为true，当用户双击构建好的程序，自动安装程序并打开，即：一键安装（one-click installer）
          oneClick: false,
          // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          allowElevation: true,
          //为当前系统的所有用户安装该应用程序 为false则用户可以选择自己安装还是所有用户安装
          perMachine: true,              
          // 允许修改安装目录，建议为 true，是否允许用户改变安装目录，默认是不允许
          allowToChangeInstallationDirectory: true,
          // 安装图标
          // installerIcon: 'resources/ico/icon.ico',
          // // 卸载图标
          // uninstallerIcon: 'resources/ico/icon.ico',
          // // 安装时头部图标
          // installerHeaderIcon: 'resources/ico/icon.ico',
          // 创建桌面图标
          createDesktopShortcut: true,
          // 创建开始菜单图标
          createStartMenuShortcut: true
        }
      },
      chainWebpackMainProcess: config => {
        config.resolve.alias.set('@', path.join(__dirname, 'src'))
      },
    },
  },
}
