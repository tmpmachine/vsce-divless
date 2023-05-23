exports.myFunction = (function () {
  
  // divless v1.0.1
  
  return (function () {
  
    let SELF = {
      tag: [], 
      replace,
    };
    
    // shortname, tagname, isSingleton, classes
    let HTMLShortname = [
      [' '  ,'div'      ,true ,''],
      ['v'  ,'video'    ,true ,''],
      ['au' ,'audio'    ,true ,''],
      ['btn','button'   ,true ,''],
      ['can','canvas'   ,true ,''],
      ['in' ,'input'    ,false,''],
      ['s'  ,'span'     ,true ,''],
      ['l'  ,'label'    ,true ,''],
      ['t'  ,'textarea' ,true ,''],
      ['sel','select'   ,true ,''],
      ['opt','option'   ,true ,''],
    ];
    
    let singletonTags = ['input','br','hr','meta','link','source','embed','img','track','command','base','area','col','keygen','param','wbr'];
    singletonTags.forEach(tag => {
      HTMLShortname.push([tag, tag, false, '']);
    });
    
    let CSSShortname = {
      'p:': 'padding:',
      'pl:': 'padding-left:',
      'pt:': 'padding-top:',
      'pr:': 'padding-right:',
      'pb:': 'padding-bottom:',
      
      'm:': 'margin:',
      'ml:': 'margin-left:',
      'mt:': 'margin-top:',
      'mr:': 'margin-right:',
      'mb:': 'margin-bottom:',
      
      'td:': 'text-decoration:',
      'tt:': 'text-transform:',
      'ff:': 'font-family:',
      'fs:': 'font-size:',
      'ft:': 'font-style:',
      'fw:': 'font-weight:',
      
      'ta:': 'text-align:',
      'ws:': 'white-space:',
      
      'f:': 'float:',
      'ov:': 'overflow:',
      
      'mw:': 'min-width:',
      'mh:': 'min-height:',
      'Mw:': 'max-width:',
      'Mh:': 'max-height:',
      'w:': 'width:',
      'h:': 'height:',
      
      'd:': 'display:',
      'vis:': 'visibility:',
      'op:': 'opacity:',
      
      'rows:': 'grid-template-rows:',
      'cols:': 'grid-template-columns:',
      'col-start:': 'grid-column-start:',
      'row-start:': 'grid-row-start:',
      'col-end:': 'grid-column-end:',
      'row-end:': 'grid-row-end:',
      'Gap:': 'grid-gap:',
      
      'col:': 'color:',
      'bg:': 'background:',
      
      'rad:': 'border-radius:',
      'bor:': 'border:',
      
      'pos:': 'position:',
      'z:': 'z-index:',
      't:': 'top:',
      'l:': 'left:',
      'r:': 'right:',
      'b:': 'bottom:',
      
      'lh:': 'line-height:',
      'jt:': 'justify-content:',
      'ali:': 'align-items:',
      'als:': 'align-self:',
      'flexdir:': 'flex-direction:',
    };
    
    const skips = [
      {open:'<!--nodivless-->', close:'<!--/nodivless-->'},
      {open:'<style', close:'</style>'},
      {open:'<script', close:'</script>'},
    ];
    
    const rules = {
      class: [
        {short: '.', prefix: ''},
      ],
      attributes: [
        {open: '{', close: '}', name: 'style'},
        {open: '"', close: '"', name: 'innerHTML'},
        {open: "'", close: "'", name: 'innerHTML'},
        {open: '@', close: ' ', name: 'id'},
        {open: '#', close: ' ', name: 'id'},
      ],
    };
    
    const state = {
      NONE: '',
      OPEN: 'open',
      SKIP: 'skip',
      TAGNAME: 'getTagName',
      ATTR: 'scanAtt',
    };
    
    let shortHandStack = [], shortHandCheck = [];
    let listen = [], ht = [], stack = [], closeTag = [], attStack = [], newMatch = [];
    let shortHandPointer = 0, dontClose = 0, pointer = 0, unClose = 0, squareAttributeCount = 0;
    let waitImportant = false, spaceOne = false, typeLock = false;
    let openingClose = '', scanType = '', attMode = '', lock = '', innerLock = '', waitSkip = '', charBypass = '', currentState = state.NONE;
    let tagStack = [];
    let skipNextLineFeeds = false;
    let settings = {
      tag: [],
    };
    
    function replaceDivless(inputText, attributes) {
        
      shortHandStack = []; 
      shortHandCheck = [];
      listen = []; 
      ht = []; 
      stack = []; 
      closeTag = []; 
      attStack = []; 
      newMatch = [];
      shortHandPointer = 0; 
      dontClose = 0; 
      pointer = 0; 
      unClose = 0;
      squareAttributeCount = 0;
      waitImportant = false;
      spaceOne = false;
      typeLock = false;
      openingClose = '';
      scanType = '';
      attMode = '';
      lock = '';
      innerLock = '';
      waitSkip = '';
      charBypass = '';
      currentState = state.NONE;
      tagStack = [];
      skipNextLineFeeds = false;
      settings = {
        tag: [],
      };
      
      for (const tag of HTMLShortname) {
        settings.tag.push({
          short: tag[0],
          tag: tag[1],
          close: tag[2],
          attributes: { class: tag[3] }
        });
      }
        
      SELF.tag.forEach(function(t) {
        settings.tag.forEach(function(s) {
          if (s.short === t.short)
            s.attributes.class = t.attributes.class;
        });
      });
      
      for (let char of inputText) {
        switch (currentState) {
          case state.OPEN:
          case state.SKIP:
            handleStateOpenOrSkip(char);
            break;
          default:
            handleOtherStates(char, attributes);
            break;
        }
      }
      
      return ht.join('');
    }
    
    
    function handleStateOpenOrSkip(char) {
      stack.push(char);
      let match = false;
      let done = false;
      
      if (currentState == state.OPEN) {
        for (const skip of skips) {
          var search = skip.open;
          
          if (search[pointer] == char) {
            match = true;
            
            if (search.length == pointer+1) {
              currentState = state.SKIP;
              waitSkip = skip.close;
  
              done = true;
              pointer = 0;
              
                for (const xs of stack)
                  ht.push(xs);
                
              stack.length = 0;
              break;
            }
          }
        }
      } else if (currentState == state.SKIP) {
        if (waitSkip[pointer] == char) {
          match = true;
          
          if (waitSkip.length == pointer+1) {
            currentState = state.NONE;
  
            done = true;
            pointer = 0;
            
              for (const xs of stack)
                ht.push(xs);
            
              
            waitSkip = '';
            stack.length = 0;
          }
        }
      }
      
      if (match) {
        if (done) return;
        
        pointer++;
      } else {
        if (currentState == state.OPEN) {
          currentState = state.NONE;
          if (stack.join('') == '<!--[') {
            attMode = '';
            unClose++;
            currentState = state.TAGNAME;
            stack.pop();
            stack.push('<');
          }
        } else {
          pointer = 0;
        }
        
        for (const xs of stack)
          ht.push(xs);
        stack.length = 0;
      }
    }
    
    function handleOtherStates(char, attributes) {
      if (scanType == 'attribute' || attMode == 'lock') {
        charBypass = char;
        char = 'a';
      }
      
      if (scanType == 'innerHTML') {
        if (char != innerLock) {
          stack.push(char);
          return;
        } else {
          innerLock = '';
        }
      }
      
      switch (char) {
        case '<':
          stack.push(char);
          pointer = 1;
          if (currentState === '')
            currentState = state.OPEN;
          break;
        case '[':
          if (currentState == 'scanTag') {
            squareAttributeCount++;
            handleRegularChar(char, attributes);
          } else {
            attMode = '';
            unClose++;
            ht.push('<');
            currentState = state.TAGNAME;
          }
          break;
        case ']':
        case '\n':
        case '\r':
          if (char == ']' && currentState == 'scanTag' && squareAttributeCount > 0) {
            squareAttributeCount--;
            handleRegularChar(char, attributes);
          } else {
            if (char == '\n') {
              if (skipNextLineFeeds) {
                skipNextLineFeeds = false;
                return;
              }
            }
            stopRender(char, attributes);
          }
          break;
        default:
          handleRegularChar(char, attributes);
      }
    }
    
    function handleRegularChar(char, attributes) {
      if (charBypass != '') {
        char = charBypass;
        charBypass = '';
      }
      
      if (char === ' ' && currentState === state.TAGNAME) {
        finishTag(attributes);
      } else if (currentState == 'scanTag') {
        let match = false;
        if (attMode == '') {
          for (const cls of rules.class) {
            if (cls.short == char) {
              match = true;
              currentState = state.ATTR;
              scanType = 'class';
              stack.push(cls.prefix);
              break;
            }
          }
        }
        
        if (!match) {
          
          if (attMode == '') {
            for (const attribute of rules.attributes) {
              if (attribute.open == char) {
                match = true;
                currentState = state.ATTR;
                
                switch (attribute.open) {
                  case '@':
                  case '#':
                    scanType = 'id';
                  break;
                  case '"':
                    scanType = 'innerHTML';
                    innerLock = '"';
                  break;
                  case "'":
                    scanType = 'innerHTML';
                    innerLock = "'";
                  break;
                  default:
                    scanType = 'attribute';
                }
                
                for (let key in CSSShortname)
                  shortHandCheck.push(key);
                break;
              }
            }
          }
          
          if (!match) {
            if (attMode == 'value') {
              attStack.push(char);
              attMode = 'lock';
              
              if (char == '"' || char == "'")
                lock = char;
              else
                lock = ' ';
            } else if (attMode == 'lock') {
              if (lock == ' ' && (char == '\n' || char == ']')) {
                attributes.attribute.push(attStack.join(''));
                attMode = '';
                lock = '';
                attStack.length = 0;
                stopRender(char, attributes);
              } else if (char == lock) {
                if (lock != ' ')
                  attStack.push(char);
                attributes.attribute.push(attStack.join(''));
                
                attMode = '';
                lock = '';
                attStack.length = 0;
              } else {
                attStack.push(char);
              }
                
            } else {
              if (char == ' ') {
                if (attMode == 'waitForValue') {
                  attributes.attribute.push(attStack.join(''));
                  attMode = '';
                  attStack.length = 0;
                } else {
                  if (!spaceOne)
                    spaceOne = true;
                }
              } else {
                attStack.push(char);
                attMode = (char == '=' ? 'value' : 'waitForValue');
              }
            }
          }
        }
      } else if (currentState == state.ATTR) {
        if ((char == ' ' && scanType != 'attribute') || char == '}' || char == '"' && scanType != 'attribute' || char == "'" && scanType != 'attribute') {
          if (scanType == 'class') {
            attributes.class.push(stack.join(''));
          } else if (scanType == 'innerHTML') {
            attributes.innerHTML.push(stack.join(''));
          } else if (scanType == 'id') {
            attributes.id.push(stack.join(''));
          } else if (scanType == 'attribute') {
            attributes.style.push(shortHandStack.join(''));
            shortHandStack.length = 0;
            shortHandPointer = 0;
          }
  
          stack.length = 0;
          currentState = 'scanTag';
          scanType = '';
        } else {
          if (scanType == 'attribute') {
            let match = false;
            for (var i = 0; i < shortHandCheck.length; i++) {
              if (shortHandCheck[i][shortHandPointer] == char)
                match = true;
              else {
                shortHandCheck.splice(i,1);
                i -= 1;
              }
            }
            
            if (match) {
              shortHandStack.push(char);
              shortHandPointer++;
              if (char == ':') {
                const start = shortHandStack.length-shortHandPointer;
                const end = shortHandPointer;
                shortHandStack.splice(start,end);
                
                for (const char of CSSShortname[shortHandCheck[0]].split(''))
                  shortHandStack.push(char);
              }
            } else {
              if (char == '!') {
                waitImportant = true;
              } else if (char == ';' || char == ' ') {
                if (char == ';' && waitImportant) {
                  char = 'important;';
                  waitImportant = false;
                }
                
                shortHandPointer = 0;
                for (let key in CSSShortname)
                  shortHandCheck.push(key);
              }
              
              shortHandStack.push(char);
            }
          } else {
            stack.push(char);
          }
        }
      } else if (currentState == state.TAGNAME) {
        tagStack.push(char);
      } else {
        ht.push(char);
      }
    }
    
    function stopRender(char, attributes) {
      if (dontClose > 0) {
        ht.push(char);
        dontClose--;
        return;
      }
      
      if (currentState == state.TAGNAME)
        finishTag(attributes);
        
      if (currentState == 'scanTag' || currentState == state.ATTR || unClose > 0) {
        if (scanType == 'class') {
          attributes.class.push(stack.join(''));
          stack.length = 0;
        } else if (scanType == 'id') {
          attributes.id.push(stack.join(''));
          stack.length = 0;
        } else if (scanType == 'innerHTML') {
          attributes.innerHTML.push(stack.join(''));
          stack.length = 0;
        }
        
        
        if (attStack.length > 0)
          attributes.attribute.push(attStack.join(''));
        
        const innerHTML = attributes.innerHTML.join('');
        const newAtt = generateAttributes(attributes);
        
        if (char == ']') {
          if (closeTag.length > 0) {
            stack.push(newAtt+openingClose+innerHTML+closeTag[closeTag.length-1]);
            closeTag.pop();
          } else {
            stack.push(char);
          }
        } else if (char == '\r') {
          stack.push(newAtt+openingClose+innerHTML+'\n');
          skipNextLineFeeds = true;
        } else {
          stack.push(newAtt+openingClose+innerHTML+'\n');
        }
        
        if (newAtt.length === 0) {
          for (const xs of stack)
            ht.push(xs);
        } else {
          for (const xs of stack)
            ht.push(xs);
        }
        
        attStack.length = 0;
        spaceOne = false;
        openingClose = '';
        stack.length = 0;
        currentState = state.NONE;
        scanType = '';
      } else {
        ht.push(char);
      }
    }
    
    function finishTag(attributes) {
      var tagName = tagStack.join('');
      var choosenTag = {
        tag: tagName,
        close: true,
        attributes: { class: '' }
      };
          
      if (tagStack.length === 0)
        choosenTag = settings.tag[0];
      
      settings.tag.forEach(function(tag) {
        if (tag.short === tagName)
          choosenTag = tag;
      });
      
      ht.push(choosenTag.tag);
      if (choosenTag.close) {
        openingClose = '>';
        closeTag.push('</'+choosenTag.tag+'>');
      } else {
        unClose--;
        openingClose = '';
        closeTag.push('/>');
      }
      currentState = 'scanTag';
      tagStack.length = 0;
      attributes.class = choosenTag.attributes.class.split(' ');
      if (attributes.class[0].length === 0)
        attributes.class.length = 0;
    }
    
    function generateAttributes(attributes) {
      const atts = [];
    
      if (attributes.id.length > 0)
        atts.push('id="'+attributes.id.join('')+'"');
      if (attributes.class.length > 0)
        atts.push('class="'+attributes.class.join(' ')+'"');
      if (attributes.attribute.length > 0)
        atts.push(attributes.attribute.join(' '));
      if (attributes.style.length > 0) {
        for (let i in attributes.style)
          if (!attributes.style[i].endsWith(';'))
            attributes.style[i] += ';';
        atts.push('style="'+attributes.style.join('')+'"');
      }
      
      attributes.id.length = 0;
      attributes.class.length = 0;
      attributes.attribute.length = 0;
      attributes.style.length = 0;
      attributes.innerHTML.length = 0;
      
      if (atts.length > 0)
        return ' '+atts.join(' ');
      else
        return atts.join(' ');
    }
    
    function replace(html) {
      const attributes = {
        class: [],
        attribute: [],
        style: [],
        id: [],
        innerHTML: []
      };
      return replaceDivless(html.split(''), attributes);
    }
    
    return SELF;
    
  })();
  
})();
