# Pokémon Look Up
A dynamic web application that allows users to search and explore Pokémon information using the PokeAPI. Built with vanilla JavaScript, HTML, and CSS, this tool provides an interactive way to discover Pokémon details including stats, sprites, and type information.

## Features

- **Search by Name or ID**: Look up any Pokémon using their name or Pokédex number
- **Interactive Navigation**: Navigate between Pokémon using forward/backward buttons
- **Random Pokémon Generator**: Discover random Pokémon with the randomize feature
- **Visual Stats Display**: View base stats in an interactive radar chart
- **Dual Sprite View**: Compare regular and shiny sprites side by side
- **Responsive Design**: Clean, modern interface with hover effects and smooth animations

## Project Status
This project is currently in development. I am restructuring PokémonLookUp as a NextJS project and giving it a complete UI overhaul.

## Project Screen Shots

#### Original Design → Concept → Current

<p align="center">
  <img width="1465" height="774" src="https://github.com/user-attachments/assets/6d342749-e6f2-4cd3-ac5e-c87dabe8d0d8" alt="Original Design" />
  <img width="420" height="231" src="https://github.com/user-attachments/assets/9486ea57-3d29-4059-80a7-cca86a2d8aef" alt="Concept" />
  <img width="1465" height="774" src="https://github.com/user-attachments/assets/b4d7bf29-c1f3-4899-8d8d-389e9cc4dba1" alt="Current Design" />
</p>

<p align="center">
  <img width="50" src="https://upload.wikimedia.org/wikipedia/commons/4/4f/Arrow_right_font_awesome.svg" alt="Arrow" />
</p>




## Installation and Setup Instructions

#### Example:  

Clone down this repository. You will need `node` and `npm` installed globally on your machine.  

Installation:

`npm install`  

To Run Test Suite:  

`npm test`  

To Start Server:

`npm start`  

To Visit App:

`localhost:3000/ideas`  

## Reflection

  - What was the context for this project? (ie: was this a side project? was this for Turing? was this for an experiment?)
  - What did you set out to build?
  - Why was this project challenging and therefore a really good learning experience?
  - What were some unexpected obstacles?
  - What tools did you use to implement this project?
      - This might seem obvious because you are IN this codebase, but to all other humans now is the time to talk about why you chose webpack instead of create react app, or D3, or vanilla JS instead of a framework etc. Brag about your choices and justify them here.  

#### Example:  

This was a 3 week long project built during my third module at Turing School of Software and Design. Project goals included using technologies learned up until this point and familiarizing myself with documentation for new features.  

Originally I wanted to build an application that allowed users to pull data from the Twitter API based on what they were interested in, such as 'most tagged users'. I started this process by using the `create-react-app` boilerplate, then adding `react-router-4.0` and `redux`.  

One of the main challenges I ran into was Authentication. This lead me to spend a few days on a research spike into OAuth, Auth0, and two-factor authentication using Firebase or other third parties. Due to project time constraints, I had to table authentication and focus more on data visualization from parts of the API that weren't restricted to authenticated users.

At the end of the day, the technologies implemented in this project are React, React-Router 4.0, Redux, LoDash, D3, and a significant amount of VanillaJS, JSX, and CSS. I chose to use the `create-react-app` boilerplate to minimize initial setup and invest more time in diving into weird technological rabbit holes. In the next iteration I plan on handrolling a `webpack.config.js` file to more fully understand the build process.
