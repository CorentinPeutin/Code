function define_temporal_where(time_classes){
  var list_where = [];
  for (const [class_number, class_dict] of time_classes){

    where  = "WHERE date_part("+class_dict.field+", to_timestamp(startsecond));
    where += "BETWEEN "+str(class_dict.start)+" AND "+str(class_dict.end);

    list_where.push(where)
  }
  return list_where;
}
