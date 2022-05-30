// webpack.config.js
const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');  //帮助生成html文件，并且自动包含bundle.js
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development'  //NODE_ENV保存在process.env对象中

const config = {
  target:'web',  //设置编译目标为web平台
  //入口路径
  //entry: path.join(__dirname, 'src/index.js'),
  entry: {
    // graphEditor: path.join(__dirname, 'trans/graphEditor.js'),
    graphEditor: path.join(__dirname, 'src/graphEditor.js'),
    bundle: path.join(__dirname, 'src/index.js')
  },
  //出口路径
  output: {
      filename: '[name].js',
      path: path.join(__dirname, 'dist')
  },
  //由于webpack本身只支持js和es5的语法，不理解vue语法，为此在rules下新增规则
  module: {
      rules: [
        {
          test: /\.vue$/,		
          loader: 'vue-loader'
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',  //把css代码以js的方式写到html里面
            'css-loader'  //读取css文件的样式
          ]
        },
        {
          test: /\.(gif|jpg|jpeg|png|svg)$/,
          use: [
            {
              loader: 'url-loader',  //把图片转换成base64格式，写在出口文件bundle.js里
              options: {
                limit: 1024,  //限制图片的大小
                name: '[name]-jkm.[ext]'  //输出图片的名字
              }
            }
          ]
        },
        {
          test: /\.style$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.less$/,
          use: [
            'style-loader',
            'css-loader',
            'less-loader'
          ]
        },
        {
          test: /\.html$/,
          loader: 'html-withimg-loader'
        },
        {
          test: /\.(eot|ttf|woff|woff2)\w*/,
          //loader: 'url-loader?limit=1000000'
          loader: 'file-loader'
        }
      ]
  },
  optimization: {
    minimize: true
  },
	plugins: [
    new CleanWebpackPlugin(),
	  //可以让webpack编译过程中，以及自己的js代码中，调用 process.env.NODE_ENV 来判断环境
	  new webpack.DefinePlugin({
	    'process.env': {
	      NODE_ENV: isDev ? '"development"' : '"production"'
	    }
	  }),
    new HTMLPlugin({
      filename: 'index.html',
      favicon: 'src/assets/img/favicon.jpg',
      template : path.join(__dirname,'./src/index.html'),
      chunks: ["graphEditor","bundle"],
      minify:{
        removeComment:true,
        collapseWhitespace:true
      }
    }),
    new VueLoaderPlugin(),
    new webpack.ProvidePlugin({ 
      $:"jquery",
      jQuery:"jquery",  
      "windows.jQuery":"jquery",
      Popper: ['popper.js', 'default']
    }) 
	]
}
if (isDev) {
  config.devtool = "#cheap-module-eval-source-map"  //帮助在浏览器调试代码，把webpack编译后的代码，通过代码的映射，转换成自己的代码。
  config.devServer = {   //
    port: 8082,  //端口
    host: '0.0.0.0',  //能同时通过localhost、127.0.0.1、本机内网IP访问
    overlay: {  //可以把webpack编译过程中出现的错误，显示到网页中
      errors: true,
    },
    hot: true,  //修改代码中数据保存后，只会重新渲染修改组件的数据，不会让整个页面重新加载。
    open:true  //自动打开浏览器
  }
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),   //使支持hot功能
    new webpack.NoEmitOnErrorsPlugin()	//减少不需要信息的展示的问题
  )
}

module.exports = config