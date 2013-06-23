# Making SoapUI a bit less painful

At work, one of the applications I work with is talking to other systems using web services. 
As such, I frequently find myself having to manually send large SOAP messages and look at the their responses.
For this work, we usually use [SoapUI](http://www.soapui.org), which keeps track of the contracts, endpoints, and our message templates. 

## The good

SoapUI has many fine qualities. First of all, it's free. Both free as in beer, and free as in open source under the [LGPL](http://www.gnu.org/copyleft/lesser.html) license. It allows us to organize our contracts and message templates into projects, and also supports automation of often repeated tasks, using Groovy as scripting language.

Besides manual testing, we use SoapUI to create simple end-to-end integration tests. 
These tests are run by our continuous integration server, and provide quick and very useful feedback in form of big red lights whenever anything major breaks.

## The bad

Despite these good qualities, however, SoapUI can at times be a pain to work with.
The GUI leaves a lot to be wanted in several areas.
For one, the window management is horrible. 
Having more than a handful of different requests open at any given time is a mess, and a recipe for losing track of what you are doing.
Furthermore, SoapUI forces the user to use the mouse for a lot of the actions, with no keyboard alternatives in many cases.
[The documentation](http://www.soapui.org/Getting-Started/10-tips-for-the-soapui-beginner/Tip-1-Right-Click-your-way-around.html) even states that "SoapUI is all about right clicking".

All this pointing and clicking can be slow and tiresome, and for some of us [literally quite painful](http://en.wikipedia.org/wiki/Repetitive_strain_injury).
To remedy this, I have made an effort to find and learn any useful keyboard shortcut available.
Listed below are the shortcuts I have found I use the most to make working with SoapUI a little less painful.

## The shortcuts

Shortcuts for working with and sending requests:

- `Alt`+`Enter` (when the request is focused) will submit the request, and move focus to the response pane.
- `Alt`+`←`/`→` moves the cursor to the value of the previous/next field in the request or response. 
- `Alt`+`F` formats the request by removing blank lines and fixing indentation. Will not work if the request is not valid. 
- `Alt`+`V` validates the request according to the schema. Given validation errors, it will usually provide sufficient information to let you know what to fix.
- `F3` or `Ctrl`+`F` brings up the search/replace dialog for the request or the response.
- `Ctrl`+`D` deletes the line with the cursor. Does not work for multiple lines; instead of deleting all selected lines, only the one where the cursor is actually resting is deleted.
- `F5` reloads a complete request from schema, optionally keeping any values already filled in.
- `Alt`+`L` toggles line numbers in the request editor.

Shortcuts for administrating the open SoapUI windows:

- `Ctrl`+`W` provides a dialog which will let you switch between your open requests using the arrow keys and `Enter`. Really useful, but only if you remember to give the requests meaningful names.
- `Ctrl`+`F9` minimizes the focused request window. Press repeatedly to clean up the workspace quickly.
- `Ctrl`+`F4` will instead close the focused request window.
- `Ctrl`+`Alt`+`L` closes all the windows, unless the request editor has focus, in which case the _goto line_ dialog box will appear.
- `Ctrl`+`Alt`+`O` closes all windows except the one with focus.
- `Ctrl`+`M` toggles maximized SoapUI desktop, i.e. hide/show the sidebar navigator.

Besides these, I have found several references to the shortcut `Ctrl`+`Alt`+`Tab`, which supposedly shifts the focus between the request and response panels of the focused window.
This unfortunately does not work for me, but perhaps you'll have more luck?

