var mapFunction2 = function() {
  var key = 1;
  var value = {
    count: 1,
    qty: this.secondsSinceOriginal
  };
  emit(key, value);
};

var reduceFunction2 = function(keySKU, countObjVals) {
  reducedVal = { count: 0, qty: 0 };
  for (var idx = 0; idx < countObjVals.length; idx++) {
    reducedVal.count += countObjVals[idx].count;
    reducedVal.qty += countObjVals[idx].qty;
  }
  return reducedVal;
};

var finalizeFunction2 = function (key, reducedVal) {
  reducedVal.avg = reducedVal.qty/reducedVal.count;
  return reducedVal;
};

db.responseTimeAnalytics.mapReduce( mapFunction2, reduceFunction2, {
  out: "responseTimeAverage",
  finalize: finalizeFunction2
 }
);


db.responseTimeAnalytics.mapReduce( function(){ emit(this.secondsSinceOriginal, 1); }, function(secondsSinceOriginal, isTrue){ return Array.sum(isTrue); }, {out: "responseTimeAnalyticsOutputSecondsDistribution"});