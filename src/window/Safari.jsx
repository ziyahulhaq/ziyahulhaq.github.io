import WindowControls from '#components/WindowControls'
import { blogPosts} from '#constants/intex'
import WindowWrapper from '#hoc/windowWrapper'
import { ChevronLeft, PanelLeft , ChevronRight , ShieldHalf ,Search , Share , Plus, Copy, MoveRight } from 'lucide-react'
import React from 'react'

const Safari = () => {
  return ( 
    <>
     <div id="window-header">
        <WindowControls target="safari" />

        <PanelLeft className="ml-10 icon" />

        <div className="flex items-center gap-1 ml-5">
          <ChevronLeft className="icon" />
          <ChevronRight className="icon" />
        </div>
        <div className="flex-center flex-1 gap-3 ">
          <ShieldHalf className="icon" />

          <div className="search">
            <Search className="icon" />
            <input
              type="text"
              placeholder="Search or enter website name"
              className="flex-1"
            />
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Share className="icon" />
          <Plus className="icon" />
          <Copy className="icon" />
        </div>
      </div>

      <div className="blog">
        <h2>Insights & Projects</h2>
            <div className="space-y-8"></div>
            {blogPosts.map(({id , title ,image , link })=> (
                    <div key={id} className="blog-post">
                    <div className="col-span-2">
                         <img src={image} alt={title} /> 

                    </div>
                        <div className='content'>
                            <h3>{title}</h3>
                            <a href={link} target='_blank' rel='noopener noreferrer'>
                                check out the full post <MoveRight className='icon-hover'/>
                            </a>
                        </div>
                    </div>
                ))}


      </div>
  </>
  )
}
const SafariWindow = WindowWrapper(Safari , "safari")
export default SafariWindow




     
        //   {articles.map((article) => (
        //     <div key={article.id} className="blog-post cursor-pointer" onClick={() => handleArticleClick(article)}>
        //       <div className="col-span-2">
        //         <img src={article.image} alt={article.title} />
        //       </div>
        //       <div className="content">
        //         <p>{article.date}</p>
        //         <h3>{article.title}</h3>
        //         <a href="#" onClick={(e) => e.preventDefault()}>
        //           Check out the full post <MoveRight className="icon-hover" />
        //         </a>
        //       </div>
        //     </div>