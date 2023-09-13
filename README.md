## Overall Project Idea
This is a project aimed at optimizing the availability of produce food items to customers in grocery stores. This is achieved through a series of photoresistors that would be placed on the surface of some sort of display storage like the one shown below. The more light that reaches the photoresistors, the less of the produce food item there is. The light levels are then read by an ESP32 (one for each type/group of food item you want to monitor) and sent to a locally hosted server. This way, grocery store employees can access a website on their phone to quickly and easily check which popular food items are running low at any given time.
![image](https://github.com/cehrensperger/produce-monitor/assets/19954402/0b75e19e-a831-465d-8303-d95bc55615b6)

## Motivation
The main motivating experience for this project originated from my time working at Price Chopper. On one of my busier shifts, I had just gotten finished with my last task for the day and was about to leave the store. However, on my way out, I realized that all of the bananas had been purchased by customers and that I had to quickly restock them for the customers that would arrive after my shift was done. I immediately tried to figure out why this problem had occurred and what I could do about it in the future. This resulted in the idea that if there was an easy way to check the status of popular produce food items without having to stop my current task, this would not have happened.

## Technologies
This produce monitoring solution uses ESP32's for the reading and sending of photoresistor data to a locally hosted Node.js/Express.js server. This server is also able to host the React website for use on the same internet connection as the grocery store. Each ESP32 is given an ID to associate its readings with and therefore, a way to keep track of which IDs correspond to which food items was needed. For this, I used an AWS RDS Database which stores mappings between IDs and food item names. This way, store employees can change the name of a food item through the website instead of having to change the code on the ESP32 for the food item they want to rename. This also means an ESP32 can easily be moved to measure a different food item.

## Example Website Screenshot
![image](https://github.com/cehrensperger/produce-monitor/assets/19954402/d6aabf6f-bf2c-4e74-a4cf-0960b6ac6f36)


