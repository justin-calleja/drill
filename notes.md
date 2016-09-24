What questions might you want answers to?

- Which are the weakest 5 items?
- Which items *depend on* item x?
- What is the definition of *depend on* for items?
- Which items *relate to* item x?
- What is the definition of *relate to* for items?


NOTE: current way of generating ids is flawed because if you have the same question in a file,
you get the same id. (is this a flaw? - it is the same question after all).

// TODO: maybe consider the use of state machines to simplify maintenance of some code.

Can you try solving the "passing down the logger" problem with currying?

Idea for timing out while generating quiz if db is too large:
https://wiki.duraspace.org/download/attachments/64329370/view-key.js?version=1&modificationDate=1415415087399&api=v2
From:
https://wiki.duraspace.org/display/FEDORA40/How+to+inspect+LevelDB
