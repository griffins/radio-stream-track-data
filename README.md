# Music track data of the http stream of Classic 105.

I used acrcloud to detect music tracks played on the http stream. Here is the data I got from tracking the station between December 2021, Jun 2022. 

The MongoDB query used is inluded in the js file. The database schema looks like the sample document included except in same rare cases with album tags where we get an object instead of an array. I fixed it by re-adding the field as a nested array and flattening it. The code below is the snippet for that.

```    
{
  $addFields: {
    "album.tags" : {
        $cond: {
            if: {$isArray : "$album.tags.tag"},
            then : "$album.tags.tag",
            else : ["$album.tags.tag"],
        }
    }
   }
}
```

#### I have included two files.
  1. Pre-processed json dump where i trimed the sample schema with what i considered (in my opinion) the only import data I need as of now.
  2. A smaller dump where I perfomed aggregated the tracks by how much they were played. I grouped the tracks by title and artists. 
  
Feel free to play with the data to see what trends and patterns you can discover. If you dont mind please let me know so i can see what you found out. 

# radio-stream-data-dump-for-analysis
