**\*\***\*\*\*\***\*\*** How to install mongo db ************\*\*************\*\*\*\*************\*\*************

1. Download mongo db from mongo db offical website
2. After installing mongo db in system then go to folder -> C:\Program Files\MongoDB\Server\5.0\bin
3. copy this path and open view advanced system settings
4. In system environment variable, select path variable and click on edit
5. After click on edit, it open new window where click on new then paste copied above folder path here.
6. open command promot (cmd) and type mongod and enter
7. Download compass from mongodb offical web site and install
8. Create data/db folder in c drive

---

**\*\***\*\*\*\***\*\*** Debug Node Js Application In VS Code **********\*\*\*\***********\*\*\***********\*\*\*\***********

1. In Terminal, select Javascript Debug Terminal
2. Place Breakpoint in source code
3. Run Application

---

****\*\*****\*\*****\*\***** Enable prettier **************\*\*\*\***************\*\*\***************\*\*\*\***************

1. Install prettier in vs code
2. In setting. json paste following lines

"editor.formatOnSave": true,
"editor.defaultFormatter": "esbenp.prettier-vscode",
"[javascript]": {
"editor.formatOnSave": true,
"editor.formatOnPaste": true,
"editor.defaultFormatter": "esbenp.prettier-vscode"
}

**********\*********** To load env file please run following command ********\*\*\*********
nodemon -r dotenv/config app.js

---

---
