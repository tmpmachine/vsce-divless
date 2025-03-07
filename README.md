# Divless HTML Watcher

One way converter for divless HTML format to regular HTML format.

## How To

Create a `.divless` folder. When you save a file inside this folder, the divless program will read the file content and replace the divless-HTML format with HTML one. **Extensions are limited to one of the following**:

```js
const allowedExtensions = ['.html', '.htm', '.razor', '.vue', '.xml'];
```

The resulted file will be created just outside the `.divless` folder.

```
.
├── .divless/
│   └── index.html
└── index.html      (generated/updated on saving .divless/index.html)
```

## Examples

Can be used together with HTML. There are shortnames for HTML tags and inline CSS properties. Visit the repository link below.

### ID, Class, other Attributes

```html
<div>
    [ #my-div .class1 .class2 data-x="100"
        Hello World.
    ]
</div>
```
Result:
```html
<div>
    <div id="my-div" class="class1 class2" data-x="100">
        Hello World.
    </div>
</div>
```

### Inline Styles
```html
[ {p:8px 16px} {bor:1px solid} {pos:absolute;top:0}
  Hello World.
]
```
Result:
```html
<div style="padding:8px 16px;border:1px solid;position:absolute;top:0">
  Hello World.
</div>
```

### Skip Format
```html
[btn "Button 1"]
<!--nodivless-->
[ #my-div
  Do not replace this part
]
<!--/nodivless-->
[btn "Button 2"]
```

Result:
```html
<button>Button 1</button>
<!--nodivless-->
[ #my-div
  Do not replace this part
]
<!--/nodivless-->
<button>Button 2</button>
```

## Links
- [divless-html](https://github.com/tmpmachine/divless-html) on GitHub.
