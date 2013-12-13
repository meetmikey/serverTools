var mapFunction2 = function() {
  var key = this.value.sent;
  var value = 1;
  emit(key, value);
};

var reduceFunction2 = function(keySKU, countObjVals) {
  return Array.sum(countObjVals);
};

var finalizeFunction2 = function (key, reducedVal) {
  reducedVal.avg = reducedVal.qty/reducedVal.count;
  return reducedVal;
};

db.sentandcoreceivemrs.mapReduce( mapFunction2, reduceFunction2, {
  out: "sentPerContact"
  //, finalize: finalizeFunction2
 }
);