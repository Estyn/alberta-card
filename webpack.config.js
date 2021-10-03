const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");
module.exports = {
    mode: 'development',
    entry: './src/index.js',
    devtool: 'inline-source-map',
    devServer: {
      static: './dist',
      allowedHosts: 'all'
    },
    plugins: [
        new HtmlWebpackPlugin({
          title: 'Development',
          template:'index.html'
        }),
        new webpack.ProvidePlugin({
             Buffer: ['buffer', 'Buffer'],
             process: 'process/browser',
        }),
      ],
      output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
      },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
           
        ],
        
    },
    resolve: {
      alias: {
        util: require.resolve("util/"),
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert/"),
        zlib: require.resolve('browserify-zlib'),
     
      }
    }
};