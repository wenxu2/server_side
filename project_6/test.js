let a = [{
    test: 1,
    test2: {
    },
}];

a.push({game: 2, test5:10});

for(let i = 0; i< a.length; i++)
{
    console.log(a[i]);

}

/*
collection.update({ "operations": {$elemMatch: {_id:oid}}}, {$addToSet: { "operations.$.parameters" : parameter}}, function(err, result) {
    if (err) {
        res.send({'error':'An error has occurred'});
    } else {
        res.send(result[0]);
    }
});*/