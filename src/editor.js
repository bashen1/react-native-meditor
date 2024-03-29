function createHTML(options = {}) {
  const {
    backgroundColor = '#FFF',
    color = '#000033',
    placeholderColor = '#a9a9a9',
    contentCSSText = '',
    cssText = '',
    pasteAsPlainText = false,
    pasteListener = false,
    keyDownListener = false,
    keyUpListener = false,
    paragraphSeparatorClass = '',
    paragraphSeparator = 'p',
    paragraphSeparatorStyle = '',
  } = options;
  //ERROR: HTML height not 100%;
  return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="user-scalable=1.0,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0">
    <style>
        * {outline: 0px solid transparent;-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-touch-callout: none;}
        html, body { margin: 0; padding: 0;font-family: Arial, Helvetica, sans-serif; font-size:1em;}
        body { overflow-y: hidden; -webkit-overflow-scrolling: touch;height: 100%;background-color: ${backgroundColor};}
        img {max-width: 98%;margin-left:auto;margin-right:auto;display: block;}
        video {max-width: 98%;margin-left:auto;margin-right:auto;display: block;}
        .content {font-family: Arial, Helvetica, sans-serif;color: ${color}; width: 100%;height: 100%;-webkit-overflow-scrolling: touch;padding-left: 0;padding-right: 0;}
        .pell { height: 100%;} .pell-content { outline: 0; overflow-y: auto;padding: 10px;height: 100%;${contentCSSText}}
        table {width: 100% !important;}
        table td {width: inherit;}
        table span { font-size: 12px !important; }
        ${cssText}
    </style>
    <style>
        [placeholder]:empty:before { content: attr(placeholder); color: ${placeholderColor};}
        [placeholder]:empty:focus:before { content: attr(placeholder);color: ${placeholderColor};}
    </style>
</head>
<body>
<div class="content"><div id="editor" class="pell"></div></div>
<script>
    var placeholderColor = '${placeholderColor}';
    var __DEV__ = !!${window.__DEV__};
    (function (exports) {
        var body = document.body, docEle = document.documentElement;
        var defaultParagraphSeparatorString = 'defaultParagraphSeparator';
        var formatBlock = 'formatBlock';
        var editor = null, o_height = 0;
        var addEventListener = function addEventListener(parent, type, listener) {
            return parent.addEventListener(type, listener);
        };
        var appendChild = function appendChild(parent, child) {
            return parent.appendChild(child);
        };
        var createElement = function createElement(tag) {
            return document.createElement(tag);
        };
        var queryCommandState = function queryCommandState(command) {
            return document.queryCommandState(command);
        };
        var queryCommandValue = function queryCommandValue(command) {
            return document.queryCommandValue(command);
        };

        var exec = function exec(command) {
            var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            return document.execCommand(command, false, value);
        };

        var postAction = function(data){
            editor.content.contentEditable === 'true' && exports.window.postMessage(JSON.stringify(data));
        };

        console.log = function (){
            __DEV__ && postAction({type: 'LOG', data: Array.prototype.slice.call(arguments)});
        }

        var anchorNode = void 0, focusNode = void 0, anchorOffset = 0, focusOffset = 0;
        var saveSelection = function(){
            var sel = window.getSelection();
            anchorNode = sel.anchorNode;
            anchorOffset = sel.anchorOffset;
            focusNode = sel.focusNode;
            focusOffset = sel.focusOffset;
        }
        
        var hasClass = function(ele, cls) {
          cls = cls || '';
          if (cls.replace(/\\s/g, '').length == 0) return false; //当cls没有参数时，返回false
          return new RegExp(' ' + cls + ' ').test(' ' + ele.className + ' ');
        }
         
        var addClass = function(ele, cls) {
          if (!hasClass(ele, cls)) {
            ele.className = ele.className == '' ? cls : ele.className + ' ' + cls;
          }
        }
         
        var removeClass = function(ele, cls) {
          if (hasClass(ele, cls)) {
            var newClass = ' ' + elem.className.replace(/[\\t\\r\\n]/g, '') + ' ';
            while (newClass.indexOf(' ' + cls + ' ') >= 0) {
              newClass = newClass.replace(' ' + cls + ' ', ' ');
            }
            elem.className = newClass.replace(/^\\s+|\\s+$/g, '');
          }
        }
        
        var focusCurrent = function (focus) {
            editor.content.focus();
            try {
                var selection = window.getSelection();
                if (anchorNode){
                    var range = document.createRange();
                    range.setStart(anchorNode, anchorOffset);
                    range.setEnd(focusNode, focusOffset);
                    focusOffset === anchorOffset && range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else {
                    selection.selectAllChildren(editor.content);
                    selection.collapseToEnd();
                }
            } catch(e){
                console.log(e)
            }
        }

        var Actions = {
            bold: { state: function() { return queryCommandState('bold'); }, result: function() { return exec('bold'); }},
            italic: { state: function() { return queryCommandState('italic'); }, result: function() { return exec('italic'); }},
            underline: { state: function() { return queryCommandState('underline'); }, result: function() { return exec('underline'); }},
            strikeThrough: { state: function() { return queryCommandState('strikeThrough'); }, result: function() { return exec('strikeThrough'); }},
            heading1: { result: function() { return exec(formatBlock, '<h1>'); }},
            heading2: { result: function() { return exec(formatBlock, '<h2>'); }},
            heading3: { result: function() { return exec(formatBlock, '<h3>'); }},
            heading4: { result: function() { return exec(formatBlock, '<h4>'); }},
            heading5: { result: function() { return exec(formatBlock, '<h5>'); }},
            heading6: { result: function() { return exec(formatBlock, '<h6>'); }},
            paragraph: { result: function() { return exec(formatBlock, '<p>'); }},
            quote: { result: function() { return exec(formatBlock, '<blockquote>'); }},
            orderedList: { state: function() { return queryCommandState('insertOrderedList'); }, result: function() { return exec('insertOrderedList'); }},
            unorderedList: { state: function() { return queryCommandState('insertUnorderedList'); },result: function() { return exec('insertUnorderedList'); }},
            code: { result: function() { return exec(formatBlock, '<pre>'); }},
            line: { result: function() { return exec('insertHorizontalRule'); }},
            link: {
                result: function(data) {
                    data = data || {};
                    var title = data.title;
                    // title = title || window.prompt('Enter the link title');
                    var url = data.url || window.prompt('Enter the link URL');
                    if (url){
                        exec('insertHTML', "<a href='"+ url +"'>"+(title || url)+"</a>");
                    }
                }
            },
            image: {
                result: function(url) {
                    if (url){
                        exec('insertHTML', "<p><img src='"+ url +"'/></p>");
                        Actions.UPDATE_HEIGHT();
                    }
                }
            },
            html: {
                result: function (html){
                    if (html){
                        exec('insertHTML', html);
                        Actions.UPDATE_HEIGHT();
                    }
                }
            },
            text: { result: function (text){ text && exec('insertText', text); }},
            video: {
                result: function(url) {
                    if (url) {
                        var thumbnail = url.replace(/.(mp4|m3u8)/g, '') + '-thumbnail';
                        exec('insertHTML', "<br><div><video src='"+ url +"' poster='"+ thumbnail + "' controls><source src='"+ url +"' type='video/mp4'>No video tag support</video></div><br>");
                        Actions.UPDATE_HEIGHT();
                    }
                }
            },
            content: {
                setDisable: function(dis){ this.blur(); editor.content.contentEditable = !dis},
                setHtml: function(html) { 
                    editor.content.innerHTML = html;
                    postAction({type: 'OFFSET_HEIGHT', data: document.querySelectorAll('#editor')[0].offsetHeight});
                },
                getHtml: function() { return editor.content.innerHTML; },
                blur: function() { editor.content.blur(); },
                focus: function() { focusCurrent(); },
                postHtml: function (){ postAction({type: 'CONTENT_HTML_RESPONSE', data: editor.content.innerHTML}); },
                setPlaceholder: function(placeholder){ editor.content.setAttribute("placeholder", placeholder) },

                setContentStyle: function(styles) {
                    styles = styles || {};
                    var bgColor = styles.backgroundColor, color = styles.color, pColor = styles.placeholderColor;
                    if (bgColor && bgColor !== body.style.backgroundColor) body.style.backgroundColor = bgColor;
                    if (color && color !== editor.content.style.color) editor.content.style.color = color;
                    if (pColor && pColor !== placeholderColor){
                        var rule1="[placeholder]:empty:before {content:attr(placeholder);color:"+pColor+";}";
                        var rule2="[placeholder]:empty:focus:before{content:attr(placeholder);color:"+pColor+";}";
                        try {
                            document.styleSheets[1].deleteRule(0);document.styleSheets[1].deleteRule(0);
                            document.styleSheets[1].insertRule(rule1); document.styleSheets[1].insertRule(rule2);
                            placeholderColor = pColor;
                        } catch (e){
                            console.log("set placeholderColor error!")
                        }
                    }
                }
            },

            init: function (){
                setInterval(Actions.UPDATE_HEIGHT, 150);
                Actions.UPDATE_HEIGHT();
            },

            UPDATE_HEIGHT: function() {
                var height = Math.max(docEle.scrollHeight, body.scrollHeight);
                if (o_height !== height){
                    postAction({type: 'OFFSET_HEIGHT', data: o_height = height});
                }
            }
        };

        var init = function init(settings) {
            var defaultParagraphSeparator = settings[defaultParagraphSeparatorString] || 'div';
            var content = settings.element.content = createElement('div');
            content.id = 'content';
            content.contentEditable = true;
            content.spellcheck = false;
            content.autocapitalize = 'off';
            content.autocorrect = 'off';
            content.autocomplete = 'off';
            content.className = "pell-content";
            content.oninput = function (_ref) {
                var firstChild = _ref.target.firstChild;
                 if (firstChild && firstChild.nodeType === 3) {
                    var res = exec(formatBlock, '<' + defaultParagraphSeparator + '>');
                    if (res) {
                        var separatorClass = '${paragraphSeparatorClass}';
                        if (separatorClass !== '') {
                           addClass(window.getSelection().focusNode.parentNode, separatorClass)
                        }
                        var separatorStyle = '${paragraphSeparatorStyle}';
                        if(separatorStyle !== ''){
                            window.getSelection().focusNode.parentNode.setAttribute('style', separatorStyle); 
                        }
                    }
                 } else if (content.innerHTML === '<br>') {
                     content.innerHTML = '';
                 }
                settings.onChange(content.innerHTML);
                saveSelection();
            };
            content.onkeydown = function (event) {
                if (event.key === 'Enter' && queryCommandValue(formatBlock) === 'blockquote') {
                    setTimeout(function () {
                        var res = exec(formatBlock, '<' + defaultParagraphSeparator + '>');
                         if (res) {
                            var separatorClass = '${paragraphSeparatorClass}';
                            if (separatorClass !== '') {
                               addClass(window.getSelection().focusNode.parentNode, separatorClass)
                            }
                            var separatorStyle = '${paragraphSeparatorStyle}';
                            if(separatorStyle !== ''){
                                window.getSelection().focusNode.parentNode.setAttribute('style', separatorStyle); 
                            }
                         }
                         return res;
                    }, 0);
                }
            };
            appendChild(settings.element, content);

            if (settings.styleWithCSS) exec('styleWithCSS');
            exec(defaultParagraphSeparatorString, defaultParagraphSeparator);

            var actionsHandler = [];
            for (var k in Actions){
                if (typeof Actions[k] === 'object' && Actions[k].state){
                    actionsHandler[k] = Actions[k]
                }
            }

            var handler = function () {
                var activeTools = [];
                for(var k in actionsHandler){
                    if ( Actions[k].state() ){
                        activeTools.push(k);
                    }
                }
                postAction({type: 'SELECTION_CHANGE', data: activeTools});
                return true;
            };

            var _handleTouchDT = null;
            var handleSelecting = function (event){
                event.stopPropagation();
                _handleTouchDT && clearTimeout(_handleTouchDT);
                _handleTouchDT = setTimeout(function (){
                    handler();
                    saveSelection();
                }, 50);
            }
            var postKeyAction = function (event, type){
                postAction({type: type, data: {keyCode: event.keyCode, key: event.key}});
            }
            var handleKeyup = function (event){
                if (event.keyCode === 8) handleSelecting (event);
                ${keyUpListener} && postKeyAction(event, "CONTENT_KEYUP")
            }
            var handleKeydown = function (event){
                ${keyDownListener} && postKeyAction(event, "CONTENT_KEYDOWN");
            }
            addEventListener(content, 'touchcancel', handleSelecting);
            addEventListener(content, 'mouseup', handleSelecting);
            addEventListener(content, 'touchend', handleSelecting);

            // Toolbar buttons activate/deactivate erratically after backspacing
            addEventListener(content, 'keyup', handleKeyup);
            addEventListener(content, 'keydown', handleKeydown);
            addEventListener(content, 'blur', function () {
                postAction({type: 'SELECTION_CHANGE', data: []});
                postAction({type: 'CONTENT_BLUR'});
            });
            addEventListener(content, 'focus', function () {
                postAction({type: 'CONTENT_FOCUSED'});
            });
            addEventListener(content, 'paste', function (e) {
                // get text representation of clipboard
                var text = (e.originalEvent || e).clipboardData.getData('text/plain');
                ${pasteListener} && postAction({type: 'CONTENT_PASTED', data: text});
                if (${pasteAsPlainText}) {
                    // cancel paste
                    e.preventDefault();
                    // insert text manually
                    document.execCommand("insertHTML", false, text);
                }
            });

            // 接收原生信息
            var message = function (event){
                var msgData = JSON.parse(event.data), action = Actions[msgData.type];
                if (action){
                    if (action[msgData.name]){
                        var flag = msgData.name === 'result';
                        flag && focusCurrent();
                        action[msgData.name](msgData.data);
                        flag && handler();
                    } else {
                        action(msgData.data);
                    }
                }
            };
            document.addEventListener("message", message , false);
            window.addEventListener("message", message , false);
            document.addEventListener('mouseup', function (event) {
                event.preventDefault();
                Actions.content.focus();
            });
            return settings.element;
        };

        editor = init({
            element: document.getElementById('editor'),
            defaultParagraphSeparator: '${paragraphSeparator}',
            onChange: function (){
                setTimeout(function(){
                    postAction({type: 'CONTENT_CHANGE', data: Actions.content.getHtml()});
                    //删除新增内容回传高度
                    postAction({type: 'OFFSET_HEIGHT', data: document.querySelectorAll('#editor')[0].offsetHeight});
                }, 10);
            }
        })
    })({
        window: window.ReactNativeWebView || window.parent,
    });
</script>
</body>
</html>
`;
}

const HTML = createHTML();
export {HTML, createHTML};
