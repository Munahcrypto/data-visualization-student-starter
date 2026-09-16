# Final Project Exploration 1

## Topic / Domain

For my final project, I am interested in exploring U.S. economic conditions and the relationship between inflation, interest rates, and consumer spending.

At this stage, I am not committed to one specific visualization. I would like to experiment with different ways of showing how changes in the economy relate to changes in consumer behavior and financial conditions.

## Questions I Might Explore

Some questions I am interested in exploring include:

- How does consumer spending change during periods of high and low inflation?
- What happens to consumer spending when the Federal Reserve raises or lowers interest rates?
- Are some periods of economic uncertainty more visible in the data than others?
- How did major events such as the 2008 financial crisis and the COVID-19 pandemic affect these relationships?
- Can users identify patterns between inflation, interest rates, and consumer spending by exploring the data interactively?

## Potential Datasets

### Federal Reserve Economic Data (FRED)

FRED provides historical economic data that could be useful for inflation, interest rates, and consumer spending.

https://fred.stlouisfed.org/

Potential series include:

- Consumer Price Index (CPI)
- Federal Funds Effective Rate
- Retail Sales

### Yahoo Finance

Yahoo Finance could also provide financial market data if I decide to incorporate stock market performance into the project.

https://finance.yahoo.com/

## Related Work / Inspiration

### FRED Data Visualizations

https://fred.stlouisfed.org/

FRED provides many examples of economic time-series visualizations. I am interested in how multiple economic indicators can be compared across the same time period.

### The New York Times Graphics

https://www.nytimes.com/spotlight/graphics

The New York Times uses interactive graphics and scrollytelling to explain complex topics. I am interested in how their visualizations guide users through a story while still allowing exploration.

## Rough Visualization Ideas

### Sketch 1: Inflation vs. Consumer Spending Over Time

My first idea is an interactive timeline comparing inflation and consumer spending in the United States over time. The two lines would allow users to see whether changes in inflation appear to move together with changes in consumer spending.

Major economic events, such as the 2008 financial crisis and the COVID-19 pandemic, could be highlighted using shaded areas. Users could also interact with the timeline to examine specific years and better understand how the relationship changed during major economic events.

**Sketch 1:**

<img width="1080" height="810" alt="WhatsApp Image 2026-08-31 at 21 21 20 (1)" src="https://github.com/user-attachments/assets/3da39123-67ff-406c-9f9c-91808163c80d" />



### Sketch 2: Interactive Economic Dashboard

My second idea is an interactive U.S. economic dashboard. It would include a larger overview chart together with separate charts for inflation, consumer spending, and interest rates.

Users could select a date range and filter by economic indicator or time period. The linked charts would update together, making it easier to compare several economic indicators during the same period.

**Sketch 2:**

<img width="1080" height="810" alt="WhatsApp Image 2026-08-31 at 21 21 20" src="https://github.com/user-attachments/assets/eb14ba55-2cb9-4927-b368-e6f9d156d524" />



### Sketch 3: Economic Period Explorer

My third idea is an economic period explorer that allows users to focus on major periods such as the 2008 financial crisis, COVID-19, and the post-COVID inflation period.

Instead of only viewing the entire timeline, users could select a specific economic period and the charts would update to show what happened to indicators such as inflation and consumer spending during that time. A short takeaway or summary could also explain the major patterns visible in the selected period.

**Sketch 3:**

<img width="1080" height="810" alt="WhatsApp Image 2026-08-31 at 21 21 19" src="https://github.com/user-attachments/assets/7b4a3332-c131-4a25-831d-2b2f9e434030" />



## Current Thoughts

At this stage, I am most interested in the interactive dashboard and economic period explorer ideas. The dashboard would make it possible to compare several indicators at the same time, while the period explorer could help users understand what happened during important economic events.

For the final project, I may combine these ideas into an interactive economic dashboard where users can filter the data by date and explore specific periods such as the 2008 financial crisis, COVID-19, and the post-COVID inflation period. I still want to experiment with the datasets and visualization techniques before deciding on the final design.

## Task Analysis

The main goal of my project is to help users explore how inflation, consumer spending, and interest rates have changed over time and understand how these economic indicators may relate to one another. Rather than focusing on a specific type of chart, the visualization should support the following tasks:

### Identify Trends Over Time

Users should be able to identify long-term and short-term trends in inflation, consumer spending, and interest rates. For example, they should be able to determine when inflation increased rapidly or when consumer spending experienced significant changes.

### Compare Economic Indicators

Users should be able to compare the behavior of different economic indicators during the same time periods. This could help determine whether changes in inflation are accompanied by changes in consumer spending or interest rates.

### Identify Significant Changes

The visualization should help users locate periods where economic indicators changed unusually quickly or moved away from their typical patterns. These periods could then be examined more closely to understand what was happening in the economy.

### Explore Major Economic Events

Users should be able to examine how inflation, consumer spending, and interest rates behaved during important economic periods such as the 2008 financial crisis, the COVID-19 pandemic, and the post-COVID inflation period. This would allow users to compare how different economic events affected the indicators.

### Examine Relationships Between Variables

Another important task is determining whether relationships exist between the economic indicators. For example, users should be able to investigate whether periods of higher inflation tend to coincide with changes in consumer spending or interest rates.

### Compare Different Time Periods

Users should be able to compare economic conditions across different periods. For example, they could compare the 2008 financial crisis with the COVID-19 period to determine whether inflation, consumer spending, and interest rates responded in similar or different ways.

### Identify Outliers and Unusual Patterns

The visualization should make it possible to identify observations or periods that differ substantially from the overall trend. These unusual patterns may reveal economic events or changes that deserve further investigation.

### Overall User Goal

Ultimately, the visualization should help users move beyond simply viewing economic data and allow them to discover patterns, make comparisons, and develop a better understanding of how inflation, consumer spending, and interest rates interact over time.

## Validation

For this project, I can use the Four Levels of Validation to make sure that I am not only creating a visualization that looks good, but also one that answers a meaningful question and is useful to the people viewing it.

### 1. Domain Situation

The main domain of my project is the U.S. economy, specifically the relationship between inflation, interest rates, and consumer spending. An ideal user could be a student, consumer, financial analyst, or anyone interested in understanding how changes in economic conditions affect consumer behavior.

The main problem I want to help users understand is how consumer spending changes when inflation rises or falls and when the Federal Reserve changes interest rates. To validate this level, I would ask potential users whether these are questions they would actually find useful and whether the visualization helps them better understand economic conditions.

### 2. Task and Data Abstraction

The main data attributes in my project are time, Consumer Price Index (CPI), Federal Funds Rate, and consumer spending or retail sales. Time is a temporal attribute, while CPI, interest rates, and spending are quantitative attributes.

The main tasks are to identify trends over time, compare different economic indicators, find periods of unusually large change, and examine possible relationships between inflation, interest rates, and consumer spending. For example, a user should be able to compare what happened to spending during periods of high inflation or after major changes in interest rates.

I would validate this level by checking whether the data and tasks I selected actually support the questions I want users to answer. I would also make sure that the FRED series are appropriate and that differences in units or time periods do not create misleading comparisons.

### 3. Visual Encoding and Interaction

At this level, I would focus on whether the information is presented in a way that users can understand easily. My current CPI visualization uses position and a line over time to show changes in the index. As the project develops, I could incorporate the other economic variables and allow users to compare their patterns.

Possible interactions could include hovering over the visualization to see exact values and dates, selecting a specific time period, or choosing which economic indicators to compare. Important periods such as the 2008 financial crisis and the COVID-19 pandemic could also be highlighted to provide context.

I would validate the design by asking users to complete simple tasks, such as identifying when CPI increased rapidly or comparing changes in inflation and consumer spending. If users struggle to interpret the visualization, I would revise the labels, visual encodings, layout, or interactions.

### 4. Algorithm

The final level focuses on whether the visualization works correctly and efficiently. The project needs to load and process the FRED data correctly and display the visualization without unnecessary delays.

I would test the application to make sure that the data loads properly, missing values are handled appropriately, and interactions respond correctly. I would also check the visualization at different screen sizes and make sure that adding multiple economic indicators does not noticeably slow down the page.

### Overall Validation

Applying these four levels will help me evaluate the project from more than just a visual perspective. I need to make sure I am addressing a useful economic question, using the appropriate data and tasks, presenting the information clearly, and implementing the visualization reliably. As the project develops, I can use feedback from classmates and potential users to improve each of these areas.
