# Slack Archive Stats

This package will traverse a directory of Slack archive files and produce a set of interesting - random? - statistics about its use. 

## Getting Started
Download the archives from your [Slack instance](https://get.slack.help/hc/en-us/articles/201658943-Export-your-team-s-Slack-history) and extract files from the zip file into a local directory.

    > npm install
    > npm start <root-directory-of-archive>

This command generates a directory of CSV files in `slack-archive-stats/results` which has the results. 

## What to Expect
1. Note that your archive will typically only have access to the public channels in your Slack instance. Depending on how your team communicates, this may be the minority of the overall messages. If you go to your [Slack stats](https://get.slack.help/hc/en-us/articles/218407447-Review-team-activity-and-statistics) page, it will show you a breakdown of public, private and group message volume. If you've enabled the big brother feature on your Slack instance, you'll get all messages. I don't recommend this becuase you'll have some trust issues with your team. :)
1. Consider this repo a general-purpose framework that you can use to explore specific questions you have. As written, it hunts for some specific, tribal habits on my team. You can easily add/subtract for your own needs.
1. The results attempt to normalize the analytics based on hire dates and produce metrics/day for each category. In order to do this, you need to supply username/start-date pairs for your entire team and add those to `lib/hire_dates.js`. There's an example there already to show you the format. The other key date is the date you started using Slack (also in that file) which you should personalize as well.

## Examples
Some example stats...
* Biggest poster (quietest)
* Who receives the most emoji reactions
* Who gives the most emoji reactions
* Who joins/leaves most channels
* Biggest message editor
* Who gets mentioned the most
* User that posts the most YouTube videos
* Who generates the most laughs
* Who receives the most thank-you emojis
* Who posts the most at night
* Who adds the most links
* Most popular channels
* Who talks about being sick the most

## Feed the Beast
Please share your pull requests. I'd love to see others find interesting stats and push those back into this repo for others.
