import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="generator" content="Next.js" />
        
        {/* Webflow CSS */}
        <link 
          href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/css/opixo.webflow.shared.269830e95.css" 
          rel="stylesheet" 
          type="text/css"
        />
        <link 
          href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/css/opixo.webflow.d46b28cbf.css" 
          rel="stylesheet" 
          type="text/css"
        />
        
        {/* Custom Investment Cards CSS */}
        <link 
          href="/styles/investment-cards.css" 
          rel="stylesheet" 
          type="text/css"
        />
        
        {/* Google Fonts */}
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
        
        {/* WebFont Loader */}
        <script 
          src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" 
          type="text/javascript"
        />
        <script 
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `WebFont.load({ google: { families: ["Manrope:300,regular,500,600,700,800"] }});`
          }}
        />
        
        {/* Webflow Touch Detection */}
        <script 
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);`
          }}
        />
        
        {/* Favicons */}
        <link 
          href="/logoremmic.png" 
          rel="shortcut icon" 
          type="image/png"
        />
        <link 
          href="/logoremmic.png" 
          rel="apple-touch-icon"
        />
        <link 
          href="/logoremmic.png" 
          rel="icon" 
          type="image/png" 
          sizes="32x32"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        
        {/* Webflow Scripts - Disabled to prevent hydration issues */}
        {/* 
        <script 
          src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=68a06250db2face4039500cc" 
          type="text/javascript" 
          integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" 
          crossOrigin="anonymous"
        />
        <script src="/js/webflow.schunk.36b8fb49256177c8.js" type="text/javascript" />
        <script src="/js/webflow.schunk.5f01b945a8ce2cbb.js" type="text/javascript" />
        <script src="/js/webflow.a9969859.ada5904f0b8150d6.js" type="text/javascript" />
        */}
      </body>
    </Html>
  )
}