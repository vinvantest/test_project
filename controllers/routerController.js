'use strict';

var helper = require('../config/helperFunctions.js');
var logger = require('../config/logger.js');
var UserModel = require('../model/UserModel.js');
var CommentModel = require('../model/CommentModel.js');
var PostModel = require('../model/PostModel.js');
var MixRefModel = require('../model/MixRefModel.js');

//console.log('Router Module - helper, Models and logger require complete');
//logger.log('info', 'Inside Router Module - helper, logger & UserModel require statement completed');

//fake database
//var users = {};
//var max_user_id = 0;

module.exports = function(server) {

    // Get http://localhost:8888/ - do not return all values. Client has to send pagination parameters
    server.get("/", function(req, res, next)
    {
        //logger.log('debug', 'reached Get / ');
        //logger.log('debug', 'Invoking UserModel.find...');
        //UserModel.find({}, function (err, users)
        //{
            //logger.log('debug', 'Inside UserModel.find() Get / ');
            var message = 'Welcome to test project apis';
            helper.success(res,next,message);
            return next();
        //});
    });

    // GET http://localhost:8888/users with pagenation example
    // GET http://localhost:8888/users?page=1&limit=5&sortBy=updated_at - worked!
    // GET http://localhost:8888/users?page=3&limit=3&sortBy=last_name - worked!
    server.get("/users", function(req, res, next)
    {
      //get url query params
      logger.log('info', 'url req.query.id passed is -> {' + JSON.stringify(req.getQuery()) + '} '
                  + 'where first param is: ' + req.query.page
                  + ' second param is: ' + req.query.limit
                  + ' third param is: ' + req.query.sortBy
                );
      //urlQqueryParams gets converted to a string due to req.getQuery() call
      //logger.log('info', 'var urlQqueryParams passed is -> {' + JSON.stringify(urlQqueryParams) + '} '
      //            + ' where first param is: ' + JSON.stringify(urlQqueryParams[0])
      //            + ' second param is: ' + JSON.stringify(urlQqueryParams[1])
      //            + ' third param is: ' + JSON.stringify(urlQqueryParams.third)
      //          );

        //logger.log('debug', 'reached Get / ');
        //logger.log('debug', 'Invoking UserModel.find...');
        /*

        SOME PAGINATION example

        // populating more than one ref
        MySchema.paginate({}, {
          page: 2,
          limit: 10,
          columns: 'title',
          populate: [ 'some_ref', 'other_ref' ],
          sortBy: {
            title: -1
          },
          lean: true
        }, callback);

        // selecting specific field for population
        // <http://mongoosejs.com/docs/api.html#query_Query-populate>
        MySchema.paginate({}, {
          columns: 'title',
          populate: [
            {
              path: 'some_ref',
              select: 'field_a field_b',
              options: {sort: {field_c: 'asc'}}
            },
            'other_ref'
          ],
          sortBy: {
            title: -1 //1
          },
          lean: true
        }, callback);

        */

        //SET default values for PAGINATION
        var query_criteria = {};
        var options = {
          page: 1, // pass 0 or 1 for the first page
          limit: 5,
          lean: true,
          sortBy: {'updated_at': -1}, //sortBy value can be -1 = descending (latest updated_at) or 1 = ascending
          columns: 'career last_name first_name created_at updated_at'
          //populate: 'first_name' //throwing castbyId error
        };

        //SET urlquery parameters to paginate
        if(req.query.page)
          options.page = parseInt(req.query.page);
        if(req.query.limit)
          options.limit = parseInt(req.query.limit);
        if(req.query.sortBy) {
          var sortByColumName = req.query.sortBy;
          options.sortyBy = {  sortByColumName: -1};
        }

        //logger.log('info', 'calling UserModel.paginate() -->');
        UserModel.paginate(query_criteria, options, function(error, results, total, pages){
        //logger.log('info', 'Inside callback UserModel.paginate() -->');
          if(error) {
            logger.log('error', 'Error: in else UserModel.paginate() --> ' + error);
            helper.failure(res,next,error,500);
            return next();
          }
          else
          {
                var next_page_number = parseInt(options.page);

                logger.log('info', 'Total Result count is = ' + parseInt(results.length));
                //for(var field in results){
                  //console.log('result[' + field + '] -->' + JSON.stringify(results[field]));
                  //logger.log('info', 'result['+field+'] -->' + JSON.stringify(results[field]));
                //}

                //Page requested is larger than total pages with the limit set then end message or error
                if(pages > 0 && parseInt(options.page) > pages) {
                  logger.log('info', 'Page=' + options.page + ' called beyond Pages='+ pages);
                  helper.failure(res,next,
                    'No records found for the Page requested: '
                    + 'Page = '
                    + options.page
                    + '. Called beyond total number of Pages with respect to limit = '
                    + pages,404);
                  return next();
                }
                else
                {
                  logger.log('info', 'query_collection_total: ' + total);
                  logger.log('info', 'number_of_pages_based_on_limit ' + pages);
                  next_page_number = parseInt(options.page) + 1;
                  if(next_page_number > pages){
                    next_page_number = -1;//reached limit. no more pages left for the next call
                  }

                  var newUrl = req.route.path
                                + '?page=' + next_page_number
                                + '&limit=' + req.query.limit
                                + '&sortBy=' + req.query.sortBy;
                  //logger.info('info', 'new URL is ->'+newUrl);
                  var returnObj = {
                    query_collection_result: results,
                    query_collection_total: total,
                    query_page_number_passed: options.page,
                    query_limit_passed: options.limit,
                    number_of_pages_based_on_limit: pages,
                    next_page_number_to_pass: next_page_number,
                    next_params_url_heotos: newUrl
                  };
                  //helper.success(res,next,results);
                  helper.success(res,next,returnObj);
                  return next();
                }
              }
        });
    });

    // GET http://localhost:8888/users/5983848f5e5b290fc49fa5fd   or
    // GET http://localhost:8888/users/59811995001b3d31b43d8da2?first=Dummy&second=Tummy
    server.get("/users/:id", function(req, res, next)
    {
      req.assert('id', 'Id is required and must be numeric').notEmpty();
      var errors = req.validationErrors();
      if(errors)
      {
        helper.failure(res,next,errors[0],400);
        return next();
      }

      logger.log('info', 'req.params.id = ' + JSON.stringify(req.params.id));

      //get Query params
      var queryParams = req.getQuery();
      logger.log('info', 'queryParams passed is -> {' + JSON.stringify(queryParams) + '} '
                  + 'where first param is: ' + JSON.stringify(req.query.first)
                  + 'second param is: ' + JSON.stringify(req.query.second)
                  + 'third param is: ' + JSON.stringify(req.query.third)
                );

      //you can loop in the query object
      for(var field in req.query){
        logger.log('info', 'Field['+field+'] = '+req.query[field]);
      }//for loop end

      UserModel.findOne({ _id: req.params.id }, function (err, user)
       {
  			if (err)
  			{
  				helper.failure(res, next, 'Something went wrong while fetching the user from the database - ' + JSON.stringify(err), 500);
  				return next();
  			}
  			if (user === null)
  			{
  				helper.failure(res, next, 'The specified user could not be found', 404);
  				return next();
  			}
            helper.success(res, next, user);
            return next();
		});


  });// GET ends

    // POST http://localhost:8888/users/
    server.post("/user", function(req, res, next)
    {
      req.assert('first_name', 'First name is required').notEmpty();
      req.assert('last_name', 'Last name is required').notEmpty();
      req.assert('email_address', 'Email address is required and must be a valid email').notEmpty().isEmail();
      //req.assert('career', 'Career must be either student, professional, or business').isIn(['student','professional','business']);
      req.assert('career', 'Career must be either student, professional, or business and not empty').notEmpty();
      var errors = req.validationErrors();
      if (errors)
      {
        helper.failure(res, next, errors, 400);
        return next();
      }
      var user = new UserModel();
      user.first_name = req.params.first_name;
      user.last_name = req.params.last_name;
      user.email_address = req.params.email_address;
      user.career = req.params.career;
      user.save(function (err)
      {
        if(err)
        {
          helper.failure(res, next, 'Error saving user to DB - ' + JSON.stringify(err), 500);
          return next();
        }
        helper.success(res,next,user);
        return next();
      });
    });

    // PUT http://localhost:8888/users/5983848f5e5b290fc49fa5fd
    //http://localhost:8888/users/59811995001b3d31b43d8da2
    server.put("/users/:id", function(req, res, next)
    {
      logger.log('info', '-------------- inside Put ---------');
      req.assert('id', 'Id is required and needs to be passed in urlQqueryParams').notEmpty();
      var errors = req.validationErrors();
      if (errors) {
      	helper.failure(res, next, errors, 400);
    		return next();
    	}
      UserModel.findOne({ _id: req.params.id }, function (err, user)
      {
  			if (err)
  			{
  				helper.failure(res, next, 'Something went wrong while fetching the user from the database', 500);
  				return next();
  			}
  			if (user === null)
  			{
  				helper.failure(res, next, 'The specified user '+ JSON.stringify(req.params.id) + 'could not be found', 404);
  				return next();
  			}
        //update same record code below
  			var updates = req.params;
  			delete updates.id;
  			for (var field in updates)
  			{
  				user[field] = updates[field];
  			}
  			user.save(function (err)
  			{
  				if (err)
  				 {
  					helper.failure(res, next, err, 500);
  					return next();
            }
              helper.success(res,next,user);
              return next();
  			});
        //Update same record code ends

		  });
    });

    // DELETE http://localhost:8888/users/5983848f5e5b290fc49fa5fd
    server.del("/users/:id", function(req, res, next)
    {
      req.assert('id', 'Id is required and must be numeric').notEmpty();
  		var errors = req.validationErrors();
  		if (errors)
  		{
  			helper.failure(res, next, errors[0], 400);
  			return next();
  		}
      UserModel.findOne({ _id: req.params.id }, function (err, user)
      {
  			if (err)
  			{
  				helper.failure(res, next, 'Something went wrong while fetching the user from the database', 500);
  				return next();
  			}
  			if (user === null)
  			{
  				helper.failure(res, next, 'The specified user could not be found', 404);
  				return next();
  			}
  			user.remove(function (err)
  			{
  				if (err)
  				{
  					helper.failure(res, next, errors, 500);
  					return next();
  				}
  				helper.success(res, next, user);
  				return next();
  			});
  		});
    });


    /*******************************************************
    *     Comments Model API Gateway
    *
    ********************************************************/

    // POST http://localhost:8888/comments/:userId
    server.post("/comments/:userId", function(req, res, next)
    {
      req.assert('commentDate', 'Commented Date is required').notEmpty();
      req.assert('commentString', 'Comments are required and cannot be empty').notEmpty();
      req.assert('commentProfile', 'Comment Profile address is required and must unique').notEmpty();
      req.assert('userId', 'User Name of the Commentor is required and must not be empty').notEmpty();
      req.assert('postTitleRef', 'postTitleRef of the Post is required and must not be empty').notEmpty();
      var errors = req.validationErrors();
      if (errors)
      {
        helper.failure(res, next, errors, 400);
        return next();
      }
      //logger.log('info', 'Inside Post Comments - finding user with userid -> ' + req.params.userId);

      //UserModel.findOne({ _id: req.params.userId }, function (err, user) //even findOne works
      UserModel.findById(req.params.userId, function (err, user)
         {
           //logger.log('info', 'Inside User model.findOne() for userid -> ' + req.params.userId);
    			if (err)
    			{
            //logger.log('error', 'Error: User model.findOne() for userid -> ' + req.params.userId);
    				helper.failure(res, next, 'Something went wrong while fetching the user from the database for the comment to be inserted in DB - ' + JSON.stringify(err), 500);
    				return next();
    			}
    			if (user === null)
    			{
            //logger.log('error', 'Error: User model.findOne() returned null for the  userid -> ' + req.params.userId);
    				helper.failure(res, next, 'The specified user' + req.params.userId +' could not be found to create comment', 404);
    				return next();
    			}
          else {
            // user found now save Comment
            var comment = new CommentModel();
            comment.commentDate = req.params.commentDate;
            comment.commentString = req.params.commentString;
            comment.commentProfile = req.params.commentProfile;
            comment.postTitleRef = req.params.postTitleRef;
            comment.commentedBy = user._id;
            comment.save(function (err)
            {
              //logger.log('info', 'Inside comment.save() with the userId ->' + JSON.stringify(user._id));
              if(err){
                helper.failure(res, next, 'Error saving comment to DB for specific user ' + JSON.stringify(user._id) + ' - ' + err, 500);
                return next();
              }
              else {
                //logger.log('info', 'Success... now sending success to router ->' + JSON.stringify(user._id));
                helper.success(res,next,comment);
                return next();
              }
            }); //end inserting comment for the specific user
          }
		   });//end find specific user

    });//End POST /comments/:userId

    // GET http://localhost:8888/users/5983848f5e5b290fc49fa5fd   or
    // GET http://localhost:8888/users/59811995001b3d31b43d8da2?first=Dummy&second=Tummy
    // Get all comments
    server.get("/comments/:userId", function(req, res, next)
    {
      req.assert('userId', 'Id is required and must be numeric').notEmpty();
      var errors = req.validationErrors();
      if(errors)
      {
        helper.failure(res,next,errors[0],400);
        return next();
      }
      logger.log('info', 'req.params.userId = ' + JSON.stringify(req.params.userId));
      //get Query params
      var queryParams = req.getQuery();//getQuery() returns string
      logger.log('info', 'queryParams passed is -> {' + JSON.stringify(queryParams) + '} '
                  + 'where first param is: ' + JSON.stringify(req.query.first)
                  + 'second param is: ' + JSON.stringify(req.query.second)
                  + 'third param is: ' + JSON.stringify(req.query.third)
                );

      //you can loop in the query object
      for(var field in req.query){
        logger.log('info', 'Field['+field+'] = '+req.query[field]);
      }//for loop end


      UserModel.findById(req.params.userId, function (err, user)
         {
           if (err){
             //logger.log('error', 'Error: User model.findOne() for userid -> ' + req.params.userId);
             helper.failure(res, next, 'Something went wrong while fetching the user '
                                        + req.params.userId
                                        + ' from the database for the comment to be inserted in DB - '
                                        + JSON.stringify(err), 500);
             return next();
           }
           if (user === null){
             //logger.log('error', 'Error: User model.findOne() returned null for the  userid -> ' + req.params.userId);
             helper.failure(res, next, 'The specified user ' + req.params.userId +' could not be found to create comment', 404);
             return next();
           }
           else {
             logger.log('info', 'Exiting UserModel.find() as user is found = ' + JSON.stringify(req.params.userId));
             return next();
           }
        });//end else of UserModel.findById()
  }, //userModel find function of get ends
  function(req, res, next) //next function to call once user is found i.e. find comments for the user
  {
    logger.log('info', 'Inside Comment function for the user id = ' + JSON.stringify(req.params.userId));
    // Below is not working .. throwing compiletime error
    //CommentModel.findOne({commentProfile: ''}).populate('commentedBy').exec( function(err, comments)
    CommentModel.find({})
                .populate({ path: 'commentedBy', select: 'first_name last_name', match: { _id : req.params.userId } })
                .exec(function(err, comments)
                  {
                    if(err) {
                        helper.failure(res, next, 'Something went wrong while fetching the comments from the database for the user  - ' + JSON.stringify(err), 500);
                        return next();
                    }
                    else {
                      logger.log('info', 'success in retrieveing all the comments for the userId '+ req.params.userId);
                      helper.success(res, next, comments);
                      return next();
                    }
                });//end exec() of comments.find().populate
  });// GET comments ends

      /*******************************************************
      *     Posts Model API Gateway
      *
      ********************************************************/

      // POST http://localhost:8888/posts/:userId
      server.post("/posts/:userId", function(req, res, next)
      {
        req.assert('postTitle', 'postTitle is required').notEmpty();
        req.assert('postCatNumber', 'postCatNumber is required and must be unique').notEmpty();
        req.assert('userId', 'User Name of the Post is required and must not be empty').notEmpty();
        var errors = req.validationErrors();
        if (errors)
        {
          helper.failure(res, next, errors, 400);
          return next();
        }
        UserModel.findById(req.params.userId, function (err, user)
           {
             //logger.log('info', 'Inside User model.findOne() for userid -> ' + req.params.userId);
      			if (err)
      			{
              //logger.log('error', 'Error: User model.findOne() for userid -> ' + req.params.userId);
      				helper.failure(res, next, 'Something went wrong while fetching the user from the database for the comment to be inserted in DB - ' + JSON.stringify(err), 500);
      				return next();
      			}
      			if (user === null)
      			{
              //logger.log('error', 'Error: User model.findOne() returned null for the  userid -> ' + req.params.userId);
      				helper.failure(res, next, 'The specified user' + req.params.userId +' could not be found to create comment', 404);
      				return next();
      			}
            else {
              // user found now save Comment
              var postOne = new PostModel();
              postOne.postTitle = req.params.postTitle;
              postOne.postCatNumber = req.params.postCatNumber;
              postOne.postedBy = user._id;
              postOne.save(function (err)
              {
                //logger.log('info', 'Inside comment.save() with the userId ->' + JSON.stringify(user._id));
                if(err){
                  helper.failure(res, next, 'Error saving Post to DB for specific user ' + JSON.stringify(user._id) + ' - ' + err, 500);
                  return next();
                }
                else {
                  //logger.log('info', 'Success... now sending success to router ->' + JSON.stringify(user._id));
                  helper.success(res,next,postOne);
                  return next();
                }
              }); //end inserting comment for the specific user
            }
  		   });//end find specific user

      });//End POST /posts/:userId

      // GET http://localhost:8888/users/5983848f5e5b290fc49fa5fd   or
      // GET http://localhost:8888/users/59811995001b3d31b43d8da2?first=Dummy&second=Tummy
      // Get all posts for userId
      server.get("/posts/:userId", function(req, res, next)
      {
        req.assert('userId', 'Id is required and must be numeric').notEmpty();
        var errors = req.validationErrors();
        if(errors)
        {
          helper.failure(res,next,errors[0],400);
          return next();
        }
        logger.log('info', 'req.params.userId = ' + JSON.stringify(req.params.userId));
        //get Query params
        var queryParams = req.getQuery();//getQuery() returns string
        logger.log('info', 'queryParams passed is -> {' + JSON.stringify(queryParams) + '} '
                    + 'where first param is: ' + JSON.stringify(req.query.first)
                    + 'second param is: ' + JSON.stringify(req.query.second)
                    + 'third param is: ' + JSON.stringify(req.query.third)
                  );

        //you can loop in the query object
        for(var field in req.query){
          logger.log('info', 'Field['+field+'] = '+req.query[field]);
        }//for loop end

        UserModel.findById(req.params.userId, function (err, user)
           {
             if (err){
               //logger.log('error', 'Error: User model.findOne() for userid -> ' + req.params.userId);
               helper.failure(res, next, 'Something went wrong while fetching the user '
                                          + req.params.userId
                                          + ' from the database for the comment to be inserted in DB - '
                                          + JSON.stringify(err), 500);
               return next();
             }
             if (user === null){
               //logger.log('error', 'Error: User model.findOne() returned null for the  userid -> ' + req.params.userId);
               helper.failure(res, next, 'The specified user ' + req.params.userId +' could not be found to create comment', 404);
               return next();
             }
             else {
               logger.log('info', 'Exiting UserModel.find() as user is found = ' + JSON.stringify(req.params.userId));
               return next();
             }
          });//end else of UserModel.findById()
      }, //userModel find function of get ends
      function(req, res, next) //next function to call once user is found i.e. find comments for the user
      {
      logger.log('info', 'Inside Comment function for the user id = ' + JSON.stringify(req.params.userId));
      // Below is not working .. throwing compiletime error
      //CommentModel.findOne({commentProfile: ''}).populate('commentedBy').exec( function(err, comments)
      PostModel.find({})
                  .populate({ path: 'postedBy', select: 'first_name last_name', match: { _id : req.params.userId } })
                  .exec(function(err, posts)
                    {
                      if(err) {
                          helper.failure(res, next, 'Something went wrong while fetching the comments from the database for the user  - ' + JSON.stringify(err), 500);
                          return next();
                      }
                      else {
                        logger.log('info', 'success in retrieveing all the comments for the userId '+ req.params.userId);
                        helper.success(res, next, posts);
                        return next();
                      }
                  });//end exec() of comments.find().populate
      });// GET comments ends


      /*******************************************************
      *     MixRefModel  API Gateway
      *
      ********************************************************/

      // POST http://localhost:8888/mixrefs/5987e4e959e37c1f340739e6
      server.post("/mixrefs/:userId", function(req, res, next)
      {
        req.assert('anyString', 'anyString is required').notEmpty();
        req.assert('anyUniqueString', 'anyUniqueString is required and must be unique').notEmpty();
        req.assert('userId', 'User Name of the Post is required and must not be empty').notEmpty();
        req.assert('commentsDataId', 'commentsDataId is required and must not be empty').notEmpty();
        req.assert('postsDataId', 'postsDataId is required and must not be empty').notEmpty();
        var errors = req.validationErrors();
        if (errors)
        {
          helper.failure(res, next, errors, 400);
          return next();
        }
        UserModel.findById(req.params.userId, function (err, user)
           {
             //logger.log('info', 'Inside User model.findOne() for userid -> ' + req.params.userId);
            if (err)
            {
              //logger.log('error', 'Error: User model.findOne() for userid -> ' + req.params.userId);
              helper.failure(res, next, 'Something went wrong while fetching the user from the database for the comment to be inserted in DB - ' + JSON.stringify(err), 500);
              return next();
            }
            if (user === null)
            {
              //logger.log('error', 'Error: User model.findOne() returned null for the  userid -> ' + req.params.userId);
              helper.failure(res, next, 'The specified user' + req.params.userId +' could not be found to create comment', 404);
              return next();
            }
            else {
              // user found now save Comment
              var mixRefOne = new MixRefModel();
              mixRefOne.anyString = req.params.anyString;
              mixRefOne.anyUniqueString = req.params.anyUniqueString;
              mixRefOne.commentsDataId = req.params.commentsDataId;
              mixRefOne.postsDataId = req.params.postsDataId;
              mixRefOne.save(function (err)
              {
                //logger.log('info', 'Inside comment.save() with the userId ->' + JSON.stringify(user._id));
                if(err){
                  helper.failure(res, next, 'Error saving MixedRef to DB for specific user ' + JSON.stringify(user._id) + ' - ' + err, 500);
                  return next();
                }
                else {
                  //logger.log('info', 'Success... now sending success to router ->' + JSON.stringify(user._id));
                  helper.success(res,next,mixRefOne);
                  return next();
                }
              }); //end inserting comment for the specific user
            }
         });//end find specific user

      });//End POST /posts/:userId


      // GET http://localhost:8888/mixrefs/5987e4e959e37c1f340739e6 or
      // GET http://localhost:8888/mixrefs/59811995001b3d31b43d8da2?first=Dummy&second=Tummy
      // Get all mixrefs for userId
      server.get("/mixrefs/:userId", function(req, res, next)
      {
        req.assert('userId', 'Id is required and must be numeric').notEmpty();
        var errors = req.validationErrors();
        if(errors)
        {
          helper.failure(res,next,errors[0],400);
          return next();
        }
        logger.log('info', 'req.params.userId = ' + JSON.stringify(req.params.userId));
        //get Query params
        var queryParams = req.getQuery();//getQuery() returns string
        logger.log('info', 'queryParams passed is -> {' + JSON.stringify(queryParams) + '} '
                    + 'where first param is: ' + JSON.stringify(req.query.first)
                    + 'second param is: ' + JSON.stringify(req.query.second)
                    + 'third param is: ' + JSON.stringify(req.query.third)
                  );

        //you can loop in the query object
        for(var field in req.query){
          logger.log('info', 'Field['+field+'] = '+req.query[field]);
        }//for loop end

        UserModel.findById(req.params.userId, function (err, user)
           {
             if (err){
               //logger.log('error', 'Error: User model.findOne() for userid -> ' + req.params.userId);
               helper.failure(res, next, 'Something went wrong while fetching the user '
                                          + req.params.userId
                                          + ' from the database for the comment to be inserted in DB - '
                                          + JSON.stringify(err), 500);
               return next();
             }
             if (user === null){
               //logger.log('error', 'Error: User model.findOne() returned null for the  userid -> ' + req.params.userId);
               helper.failure(res, next, 'The specified user ' + req.params.userId +' could not be found to create comment', 404);
               return next();
             }
             else {
               logger.log('info', 'Exiting UserModel.find() as user is found = ' + JSON.stringify(req.params.userId));
               return next();
             }
          });//end else of UserModel.findById()
      }, //userModel find function of get ends
      function(req, res, next) //next function to call once user is found i.e. find comments for the user
      {
      logger.log('info', 'Inside MixRefModel.Populate function for the user id = ' + JSON.stringify(req.params.userId));
      // Below is not working .. throwing compiletime error
      //CommentModel.findOne({commentProfile: ''}).populate('commentedBy').exec( function(err, comments)
      /*var populateQuery = [{ path: 'commentsDataId',
                              select: 'commentString commentProfile postTitleRef',
                              match: { _id : req.params.commentsDataId }
                            },
                            { path: 'postsDataId',
                              select: 'postTitle postCatNumber postedBy',
                              match: { _id : req.params.postsDataId }
                            }];*/

      // Blog.user.review
      //mixRef.post.user

      /*
      Imp: The result of populateQuery is MixRef.
                                                postsDataId.
                                                          postedBy: userid.
                                                                          first_name
                                                                          career
                                                commentsDataId
                JSON Object Returned - http://localhost:8888/mixrefs/5987e4e959e37c1f340739e6
                {
                  "_id": "598a913022bffa0334b6cfed",
                  "updated_at": "2017-08-09T04:36:00.327Z",
                  "created_at": "2017-08-09T04:36:00.327Z",
                  "postsDataId": {
                      "_id": "598a89b3067a8f1608a664b6",
                      "postedBy":
                      {
                          "_id": "5987e4e959e37c1f340739e6",
                          "first_name": "Surya",
                          "career": "business"
                      },
                      "postCatNumber": "jrsdrt463",
                      "postTitle": "My Next Post Title"
                  },
                  "commentsDataId": {
                      "_id": "598943bdaeccf20d908e81de",
                      "commentProfile": "jslo98292",
                      "commentString": "My THIRD comment"
                  },
                  "anyUniqueString": "uims24w22",
                  "anyString": "Jabber Jabber",
                  "__v": 0
              }
      */

      var populateQuery = [{  path: 'commentsDataId',
                              select: 'commentString commentProfile postTitleRef',
                              match: { _id : req.params.commentsDataId }
                              },
                              { path: 'postsDataId',
                                select: 'postTitle postCatNumber postedBy',
                                populate: { path: 'postedBy', select: 'first_name career'},
                                match: { _id : req.params.postsDataId }
                              }];

      /*
      even this works ... if you don't want to declare a var for populateQuery
      MixRefModel.find({})
                  .populate([{ path: 'commentsDataId',
                                          select: 'commentString commentProfile',
                                          match: { _id : req.params.commentsDataId }
                                        },
                                        { path: 'postsDataId',
                                          select: 'postTitle postCatNumber',
                                          match: { _id : req.params.postsDataId }
                                        }])
                  .exec(function(err, mixRef){}
      */

/*
      Populating across multiple levels
      Firstly, update mongoose 3 to 4 & then use the simplest way for deep population in mongoose as below :
      Suppose you have Blog schema having userId as ref Id & then in User you have some review as ref Id for schema Review. So Basically, you have three schema : 1. Blog 2. User 3. Review
      And, you have to query from blog, which user owns this blog & the user review. So you can query your result as :

      <BlogModel>.find({})
                .populate(
                          {
                            path : 'userId',
                            populate : {path : 'reviewId'}
                          })
                .exec(function (err, res)
                {
               });
      //------------------------
      Say you have a user schema which keeps track of the user's friends.
        var userSchema = new Schema(
        {
          name: String,
          friends: [{ type: ObjectId, ref: 'User' }]
        });
        Populate lets you get a list of a user's friends, but what if you also wanted a user's friends of friends? Specify the populate option to tell mongoose to populate the friends array of all the user's friends:

        User.findOne({ name: 'Val' })
        .populate(
        {
            path: 'friends',
            // Get friends of friends - populate the 'friends' array for every friend
            populate: { path: 'friends' }
        });
        Reference: http://mongoosejs.com/docs/populate.html#deep-populate
      */
      MixRefModel.find({})
                  .populate(populateQuery)
                  .exec(function(err, mixRef)
                    {
                      if(err) {
                          helper.failure(res, next, 'Something went wrong while fetching the comments from the database for the user  - ' + JSON.stringify(err), 500);
                          return next();
                      }
                      else {
                        logger.log('info', 'success in retrieveing all the comments for the userId '+ req.params.userId);
                        helper.success(res, next, mixRef);
                        return next();
                      }
                  });//end exec() of mixRef.find().populate
      });// GET mixRef ends


//----------- No function Codeing below this line ----------------

}//router.js module.exports end
