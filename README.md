# ONLINE WEB 3.0 CHESS-APP

This code repository contains an app where you can play chess offline and also online by sharing the game's link. The upcoming updates will let you bet using crypto for each game and also play with a chess bot. 
For now I have implemented transfer of crypto by connecting metamask accounts. This is still an unfinished project so chill out!

## Dependencies

### FRONTEND
![image](screenshots/Frontend.png)

### BACKEND

![image](screenshots/Backend.png)
<img src="screenshots/harhat.png" height=50% width=50%"></img>  
HARDHAT

## How to use
Download the github repository to your computer. Install node js from the internet. Go to terminal and change the directory to where you have downloaded the repository and change your directory to the client file:

`cd client`

Then type out:

`npm install`

After all the required packages are installed from the package.json, type:

`npm run dev`

A localhost will be created and if u go to the link, you can use the website.

## Home Page

As soon as you enter the website you would get a pop-up from metamask asking you to connect your wallet to the app. If you don't have metamask, you will be prompted to do so. You can create an account and download 
metamask from chrome web store.

![mainpage metamasl prompt](/screenshots/mainpage_metamask_prompt.png)

As soon as you link your metamask account you can view the webpage.

![](/screenshots/Home1.png)
![](/screenshots/Home2.png)
![](/screenshots/Home3.png)

Click on "Play Game", you would be routed to the Game Select Page.

![](/screenshots/GameSelect.png)

# Local Game Page

![](/screenshots/LocalWhite.png)

Once Player 1 makes a move, the board flips and waits for Player 2 to make a move.

![](/screenshots/LocalBlack.png)

# Online Game

If you select online game option in the Game Select Page then you will be routed to a new page which asks you to enter your name.

![](/screenshots/Enteryourname.png)

You will be routed to a page which asks you to select a piece: white, black or random.

![](/screenshots/OnlinePieceSelect.png)

You will be routed to a new GamePage with a link that has a unique id. Share this link to your friend and once your friend opens the link from another device, your game starts.

![](/screenshots/OnlineGameLinkShare.png)

At the endgame, your page would look like this:

![](/screenshots/Lost.png)
