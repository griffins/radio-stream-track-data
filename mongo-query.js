db.content.aggregate(
[
    {$addFields : {"timestamp" : {$dateFromString: {dateString: "$data.metadata.timestamp_utc"}}}},
//    {
//        $match : {
//           "timestamp" : {
//                $gte :  ISODate("2022-04-01"),
//                $lte :  ISODate("2022-04-30")
//           }
//        }
//    },
    {
        $project:{
            data:{
                metadata:{
                    music:{
                        title : true,
                        album : {
                            name: true,
                            artist : true,
                            tags : {tag : { name :true }}
                        },
                        artists : { name : true},
                        genres : true
                    }
                }
            },
            timestamp: true,
            _id:false
        }
    },
    { $addFields: { "data.metadata.music": { $first: "$data.metadata.music" } } },
    { $addFields : {"data.metadata.music.timestamp" : { $toString : "$timestamp"}}},
    { $replaceRoot: { newRoot: "$data.metadata.music" } },
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
    },
    { $addFields:
        {
            artist: {
                $reduce: {
                    input : "$artists.name",
                    initialValue : "",
                    in : {
                        $concat : [
                        "$$value",
                         {
                            $cond: {
                                if: {
                                    $eq: [ "$$value", "" ] },
                                    then: "",
                                    else: ", "
                                }
                          },
                        "$$this"
                      ]
                  }
                }
            },
            genres : {
                $reduce: {
                        input : "$genres.name",
                        initialValue : "",
                        in : {
                            $concat : [
                            "$$value",
                             {
                                $cond: {
                                    if: {
                                        $eq: [ "$$value", "" ] },
                                        then: "",
                                        else: ", "
                                    }
                              },
                            "$$this"
                          ]
                      }
                }
            },
            album : {
                    tags : {
                        $reduce: {
                                input : "$album.tags.name",
                                initialValue : "",
                                in : {
                                    $concat : [
                                        "$$value",
                                         {
                                            $cond: {
                                                if: {
                                                    $eq: [ "$$value", "" ] },
                                                    then: "",
                                                    else: ", "
                                                }
                                          },
                                        "$$this"
                                     ]
                                }
                        }
                    }
            }
        }
    },
    {$group: {_id:{title: "$title", artist : "$artist"}, play_count : {$count: {}}, root : {$first : "$$ROOT"}}},
    {$unset: "_id"},
    {"$replaceRoot": { "newRoot": { "$mergeObjects": ["$root", { play_count: "$total_plays" }]} }},
    {$sort : {play_count: -1}},
]
)
