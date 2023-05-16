# divlesshtml

One way converter for divless HTML format to regular HTML format.

## Features

Open an HTML file, then run `Create Divless HTML` command from command palette. It will generate a `.divless` folder on the same path and put a copy of the original file in it with `.divless` prepended to its original file extension.

When you open an HTML file, this extension will check existing `.divless.originalExtension` file and open that file instead.

When you save changes to the `.divless.originalExtension` file, it will convert divless HTML format into regular HTML and save it to the original file.

## Switching to regular HTML

It is discouraged to make changes to the original file if there's an existing divless version of it because it's a one way converter.

You can safely delete `.divless` file or `.divless` folder if you want to stop using divless HTML format and make changes in the original file instead.

## Commits

It's important to commit `.divless` folder if your team also use divless HTML format.

## Not HTML Replacement

Divless HTML is not a replacement for HTML format. Instead, this enhance it. By writing overused element container and classes in divless HTML format, it will become less distractivee on text editor. 

The recommended way is to replace any elements related to UI with divless HTML and use regular HTML for elements that's tied to app logic such as displaying dynamic data.

## Advantages

- No more typing `div`.
- Nameless closing tags.
- Only use two brackets for a whole tag section: one for open tag, one for close tag.
- Flexibility in adding inline style and classes. 
If you write more than one inline style of class attribute in divless HTML format, it will be concatenated by the order of appearance from left to right.
- Has HTML tag and inline style property shortnames.

## Disadvantages

- Harder to spot unclosed tags.
Make sure you use identation carefully because closing tags now become nameless and there's no development of intellisense yet.
- Might not work well with autocompletion such as Emmet because the editor doesn't recognize the format and assume you're writing a plain text.
- It's still newly known. Might take a while until somebody develop intellisense and syntax highlighter for divless HTML format.

## Extension Settingss

This extension contributes the following settings:

* `divlesshtml.createDivlessHTMLFile`: Create .divless.`originalExtension` file at `.divless` folder on the same path.

## Known Issues

Below are current limitation of divless HTML library :
- Unable to nest divless tag in a single line.
- If your JS framework use square brackets as HTML attribute for data logic, beware that it will be recognized as divless tag.