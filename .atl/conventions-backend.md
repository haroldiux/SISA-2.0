11.2 [Backend]

Java Spring Boot

The intention of this guide is to provide a set of conventions that encourage and follow good code conventions.

Class Structure

A java class should have the following structure:

1

package com.example.model;

2

import com.example.util.FileUtil;

3

/**

4

* Imple me n ta tio n -fre e pe rs pe c tive to b e re a d b y de ve

lo pe rs

5

* wh o mig h t n o t n e c e s s a rily h a ve th e s o u rc e c o de a t

h a n d

6

*

7

* @autho r Firs tn a me la s tn a me

8

*

9

* O ptio n a l c la s s s pe c ific c o mme n t

10

*/

11

public class SomeClass {

12

13

// Sta tic a ria b le s in o rde r o f vis ib ility

14

public static final Integer PUBLIC_COUNT = 1;

15

static final Integer PROTECTED_COUNT = 1;

16

private static final Integer PRIVATE COUNT = 1;

17

18

// In s ta n c e va ria b le s in o rde r o f vis ib ility

19

public String name;

20

String postalCode;

21

private String address;

22

23

// C o n s tru c to r a n d o ve rlo a de d in s e q u e n tia l o rde r

24

public SomeClass() {}

25

public SomeClass(String name) {

26

this.name = name;

27

}

28

29

// Me th o ds

30

public String doSomethingUseful() {

31

return "Something useful";

32

}

33

}

Use of line breaks and spaces There are generally two reasons to insert a line break:

Your statement exceeds the column limit (maximum of 120 characters per line). Itʼs important to eliminate the need for horizontal scrolling a place line breaks after a comma and operator.

You want to logically separate a thought. For example, one blank line between methods.

Indentation helps organize your code to make it easy to read. An indentation of 4 columns is defined in the project. Here is a listing of best practices:

Methods

/*AVO ID*/public String donwloadAnInternet(Internet, Tubes tubes,Blogspehere blogs, Amount<Long Data> bandwidth){tubes download(internet);6 }/*AVO ID*/public String donwloadAnInternet(Internet, Tubes tubes,Blogspehere blogs, Amount<Long Data> bandwidth){tubes download(internet);6 }/*PREFER*/public String donwloadAnInternet(Internet, Tubes tubes,Blogospehere blogs, Amount<Long, Data> bandwidth) {tubes.download(internet);5 }/*PREFER*/public String donwloadAnInternet(Internet, Tubes tubes,Blogospehere blogs, Amount<Long, Data> bandwidth) {tubes.download(internet);5 }

/*AVO ID*/

public String donwloadAnInternet(Internet, Tubes tubes,

Blogspehere blogs, Amount<Long Data> bandwidth)

{

tubes download(internet);

6 }

/*AVO ID*/

public String donwloadAnInternet(Internet, Tubes tubes,

Blogspehere blogs, Amount<Long Data> bandwidth)

{

tubes download(internet);

6 }

/*PREFER*/

public String donwloadAnInternet(Internet, Tubes tubes,

Blogospehere blogs, Amount<Long, Data> bandwidth) {

tubes.download(internet);

5 }

/*PREFER*/

public String donwloadAnInternet(Internet, Tubes tubes,

Blogospehere blogs, Amount<Long, Data> bandwidth) {

tubes.download(internet);

5 }

If Statement

/*AVO ID*/if (condition) statement;/*AVO ID*/if (condition) statement;/*PREFER*/if (condition) {statement;4 }/*PREFER*/if (condition) {statement;4 }

/*AVO ID*/

if (condition) statement;

/*AVO ID*/

if (condition) statement;

/*PREFER*/

if (condition) {

statement;

4 }

/*PREFER*/

if (condition) {

statement;

4 }

/*AVO ID*/if (x < 0) negative(x);/*AVO ID*/if (x < 0) negative(x);/*PREFER*/if (x < 0) {negative(x);4 }/*PREFER*/if (x < 0) {negative(x);4 }

/*AVO ID*/

if (x < 0) negative(x);

/*AVO ID*/

if (x < 0) negative(x);

/*PREFER*/

if (x < 0) {

negative(x);

4 }

/*PREFER*/

if (x < 0) {

negative(x);

4 }

/*AVO ID*/if (a == b && c == d) {...4 }/*AVO ID*/if (a == b && c == d) {...4 }/*PREFER*/if ((a == b) && (c == d)) {...4 }/*PREFER*/if ((a == b) && (c == d)) {...4 }

/*AVO ID*/

if (a == b && c == d) {

...

4 }

/*AVO ID*/

if (a == b && c == d) {

...

4 }

/*PREFER*/

if ((a == b) && (c == d)) {

...

4 }

/*PREFER*/

if ((a == b) && (c == d)) {

...

4 }

/*AVO ID*/if ((condition1 && condition2)|| condition3 && condition4||!(condition5 && condition6)) { //BAD WRAPSdoSomethingAboutIt(); //MAKE THIS LINE EASY TO MISS6 }/*AVO ID*/if ((condition1 && condition2)|| condition3 && condition4||!(condition5 && condition6)) { //BAD WRAPSdoSomethingAboutIt(); //MAKE THIS LINE EASY TO MISS6 }/*PREFER*/if ((condition1 && condition2)|| (condition3 && condition4)|| !(condition5 && condition6)) {doSomethingAboutIt();/*PREFER*/if ((condition1 && condition2)|| (condition3 && condition4)|| !(condition5 && condition6)) {doSomethingAboutIt();

/*AVO ID*/

if ((condition1 && condition2)

|| condition3 && condition4

||!(condition5 && condition6)) { //BAD WRAPS

doSomethingAboutIt(); //MAKE THIS LINE EASY TO MISS

6 }

/*AVO ID*/

if ((condition1 && condition2)

|| condition3 && condition4

||!(condition5 && condition6)) { //BAD WRAPS

doSomethingAboutIt(); //MAKE THIS LINE EASY TO MISS

6 }

/*PREFER*/

if ((condition1 && condition2)

|| (condition3 && condition4)

|| !(condition5 && condition6)) {

doSomethingAboutIt();

/*PREFER*/

if ((condition1 && condition2)

|| (condition3 && condition4)

|| !(condition5 && condition6)) {

doSomethingAboutIt();

6 }6 }

6 }

6 }

Ternary Operator

1 alpha = (aLongBooleanExpression) ? beta : gamma;1 alpha = (aLongBooleanExpression) ? beta : gamma;alpha = (aLongBooleanExpression) ? beta: gamma;alpha = (aLongBooleanExpression) ? beta: gamma;

1 alpha = (aLongBooleanExpression) ? beta : gamma;

1 alpha = (aLongBooleanExpression) ? beta : gamma;

alpha = (aLongBooleanExpression) ? beta

: gamma;

alpha = (aLongBooleanExpression) ? beta

: gamma;

When the ternary operator expression is very long, it should be placed as follows

alpha = (aLongBooleanExpression)? beta: gamma;alpha = (aLongBooleanExpression)? beta: gamma;

alpha = (aLongBooleanExpression)

? beta

: gamma;

alpha = (aLongBooleanExpression)

? beta

: gamma;

Exception Messages

When the error messages are very long, it should be organized as follows:

1 throw new IllegalStateException("Failed to process"2+ " request " + request.getId()3+ " for user " + user.getId()4+ " query: '" + query.getText() + "'");1 throw new IllegalStateException("Failed to process"2+ " request " + request.getId()3+ " for user " + user.getId()4+ " query: '" + query.getText() + "'");

1 throw new IllegalStateException("Failed to process"

2+ " request " + request.getId()

3+ " for user " + user.getId()

4+ " query: '" + query.getText() + "'");

1 throw new IllegalStateException("Failed to process"

2+ " request " + request.getId()

3+ " for user " + user.getId()

4+ " query: '" + query.getText() + "'");

Iterators and Streams

/*AVO ID*/Iterable<Module> modules = ImmutableList.<Module>builder().add(new LifecycleModule()).add(new AppLauncherModule()).addAll(application.getModules()).build();/*AVO ID*/Iterable<Module> modules = ImmutableList.<Module>builder().add(new LifecycleModule()).add(new AppLauncherModule()).addAll(application.getModules()).build();/*PREFER*/Iterable<Module> modules = ImmutableList.<Module>builder().add(new LifecycleModule()).add(new AppLauncherModule()).addAll(application.getModules()).build();/*PREFER*/Iterable<Module> modules = ImmutableList.<Module>builder().add(new LifecycleModule()).add(new AppLauncherModule()).addAll(application.getModules()).build();

/*AVO ID*/

Iterable<Module> modules = ImmutableList.<Module>builder()

.add(new LifecycleModule())

.add(new AppLauncherModule()).addAll(application.getMo

dules()).build();

/*AVO ID*/

Iterable<Module> modules = ImmutableList.<Module>builder()

.add(new LifecycleModule())

.add(new AppLauncherModule()).addAll(application.getMo

dules()).build();

/*PREFER*/

Iterable<Module> modules = ImmutableList.<Module>builder()

.add(new LifecycleModule())

.add(new AppLauncherModule())

.addAll(application.getModules())

.build();

/*PREFER*/

Iterable<Module> modules = ImmutableList.<Module>builder()

.add(new LifecycleModule())

.add(new AppLauncherModule())

.addAll(application.getModules())

.build();

Declarations and Assignments

/*AVO ID*/Integer level, sizeMeter;/*AVO ID*/Integer level, sizeMeter;/*PREFER*/Integer level;Integer sizeMeter;/*PREFER*/Integer level;Integer sizeMeter;

/*AVO ID*/

Integer level, sizeMeter;

/*AVO ID*/

Integer level, sizeMeter;

/*PREFER*/

Integer level;

Integer sizeMeter;

/*PREFER*/

Integer level;

Integer sizeMeter;

/*AVO ID*/d = (a = b + c) + r;/*AVO ID*/d = (a = b + c) + r;/*PREFER*/a = b + c;d = a + r;/*PREFER*/a = b + c;d = a + r;

/*AVO ID*/

d = (a = b + c) + r;

/*AVO ID*/

d = (a = b + c) + r;

/*PREFER*/

a = b + c;

d = a + r;

/*PREFER*/

a = b + c;

d = a + r;

/*AVO ID*/String args[]/*AVO ID*/String args[]

/*AVO ID*/

String args[]

/*AVO ID*/

String args[]

/*PREFER*/String[] args;/*PREFER*/String[] args;

/*PREFER*/

String[] args;

/*PREFER*/

String[] args;

/*AVO ID*/Long timeout = 3000000000l;/*AVO ID*/Long timeout = 3000000000l;/*PREFER*/Long timeout = 3000000000L;/*PREFER*/Long timeout = 3000000000L;

/*AVO ID*/

Long timeout = 3000000000l;

/*AVO ID*/

Long timeout = 3000000000l;

/*PREFER*/

Long timeout = 3000000000L;

/*PREFER*/

Long timeout = 3000000000L;

Switch

switchswitchWhen it comes toit's best practice to:

switch

switch

Always have a default case even without code

/*EXAMPLE*/switch (condition) {/*EXAMPLE*/switch (condition) { User /* falls through */ to indicate the control falls to the next case

/*EXAMPLE*/

switch (condition) {

/*EXAMPLE*/

switch (condition) {

3

case ABC:

4

statements;

5

/* fa lls th ro u g h */

6

case DEF:

7

statements;

8

break;

9

default:

10

statements;

11

break;

12

}

PascalCasePascalCaseNaming

PascalCase

PascalCase

Class and interface names are avoid acronyms/abbreviations.

and it is recommended to use the whole word and

PascalCasePascalCase*.java*.javaPackage: names com.deepspace over com.deepSpace or com.deep_space.

PascalCase

PascalCase

*.java

*.java

File: names are

and end with

matching the class name.

UpperCaseUpperCase__Method: names should be verbs in mixed cases with each internal word capitalized, for example, run() or runFast().

UpperCase

UpperCase

_

_

Constants: names should be

with

separating each word, for example:

1 Integer MIN_WIDTH = 44;1 Integer MIN_WIDTH = 44;

1 Integer MIN_WIDTH = 44;

1 Integer MIN_WIDTH = 44;

Variable: a name that tells the reader of the program what the variable represents. Keep the variable names short and avoid including metadata.

/*AVO ID*/Integer schoolIdentificationNumber;Integer[] userProvidedSchoolIds;Integer[] schoolIdsAfterRemovingDuplicates;Map<Integer, User> idToUserMap;String valueString;/*AVO ID*/Integer schoolIdentificationNumber;Integer[] userProvidedSchoolIds;Integer[] schoolIdsAfterRemovingDuplicates;Map<Integer, User> idToUserMap;String valueString;

/*AVO ID*/

Integer schoolIdentificationNumber;

Integer[] userProvidedSchoolIds;

Integer[] schoolIdsAfterRemovingDuplicates;

Map<Integer, User> idToUserMap;

String valueString;

/*AVO ID*/

Integer schoolIdentificationNumber;

Integer[] userProvidedSchoolIds;

Integer[] schoolIdsAfterRemovingDuplicates;

Map<Integer, User> idToUserMap;

String valueString;

/*PREFER*/Integer schoolId;Integer[] filteredSchoolIds;Integer[] uniqueSchooldIds;Map<Integer, User> usersById;String value;/*PREFER*/Integer schoolId;Integer[] filteredSchoolIds;Integer[] uniqueSchooldIds;Map<Integer, User> usersById;String value;

/*PREFER*/

Integer schoolId;

Integer[] filteredSchoolIds;

Integer[] uniqueSchooldIds;

Map<Integer, User> usersById;

String value;

/*PREFER*/

Integer schoolId;

Integer[] filteredSchoolIds;

Integer[] uniqueSchooldIds;

Map<Integer, User> usersById;

String value;

Clean Code

A best practice to have a clean code, we can use the tool called Sonarqube, but as well we can follow the next recommendations.

Delete unused code (imports, fields, parameters, methods, classes).

When declaring fields and methods, itʼs better to use generic types whenever possible.

/*AVO ID*/interface Database {ArrayList<User> fetchUsers(String query);4 }/*AVO ID*/interface Database {ArrayList<User> fetchUsers(String query);4 }/*PREFER*/interface Database {List<User> fetchUsers(String query);4 }/*PREFER*/interface Database {List<User> fetchUsers(String query);4 }

/*AVO ID*/

interface Database {

ArrayList<User> fetchUsers(String query);

4 }

/*AVO ID*/

interface Database {

ArrayList<User> fetchUsers(String query);

4 }

/*PREFER*/

interface Database {

List<User> fetchUsers(String query);

4 }

/*PREFER*/

interface Database {

List<User> fetchUsers(String query);

4 }

In classes take what you need, nothing more. The key idea is to defer assembly to the layers of the code that know enough to assemble and instead just take the minimal interface you need to get your work done.

/*AVO ID*//*** We ig h e r u s e s h o s ts a n d po rt o n ly to imme dia te ly c o n s tru c t a n o th e r o b je c t.*/class Weigher {private final double defaultInitialRate;Weigher(Iterable<String> hosts, int port, double d efaultInitialRate) {this.defaultInitialRate = validateRate(defaultIn itialRate);this.weightingService = createWeightingServiceClient(hosts, port);}12 }/*AVO ID*//*** We ig h e r u s e s h o s ts a n d po rt o n ly to imme dia te ly c o n s tru c t a n o th e r o b je c t.*/class Weigher {private final double defaultInitialRate;Weigher(Iterable<String> hosts, int port, double d efaultInitialRate) {this.defaultInitialRate = validateRate(defaultIn itialRate);this.weightingService = createWeightingServiceClient(hosts, port);}12 }/*PREFER*/class Weigher {private final double defaultInitialRate;Weigher(WeightingService weightingService, double defaultInitialRate) {/*PREFER*/class Weigher {private final double defaultInitialRate;Weigher(WeightingService weightingService, double defaultInitialRate) {

/*AVO ID*/

/**

* We ig h e r u s e s h o s ts a n d po rt o n ly to imme dia te ly c o n s tru c t a n o th e r o b je c t.

*/

class Weigher {

private final double defaultInitialRate;

Weigher(Iterable<String> hosts, int port, double d efaultInitialRate) {

this.defaultInitialRate = validateRate(defaultIn itialRate);

this.weightingService = createWeightingServiceCl

ient(hosts, port);

}

12 }

/*AVO ID*/

/**

* We ig h e r u s e s h o s ts a n d po rt o n ly to imme dia te ly c o n s tru c t a n o th e r o b je c t.

*/

class Weigher {

private final double defaultInitialRate;

Weigher(Iterable<String> hosts, int port, double d efaultInitialRate) {

this.defaultInitialRate = validateRate(defaultIn itialRate);

this.weightingService = createWeightingServiceCl

ient(hosts, port);

}

12 }

/*PREFER*/

class Weigher {

private final double defaultInitialRate;

Weigher(WeightingService weightingService, double defaultInitialRate) {

/*PREFER*/

class Weigher {

private final double defaultInitialRate;

Weigher(WeightingService weightingService, double defaultInitialRate) {

5678this.defaultInitialRate = validateRate(defaultInitialRate);this.weightingService = checkNotNull(weightingService);}}5678this.defaultInitialRate = validateRate(defaultInitialRate);this.weightingService = checkNotNull(weightingService);}}

5

6

7

8

this.defaultInitialRate = validateRate(defaultInitialRate);

this.weightingService = checkNotNull(weightingService);

}

}

5

6

7

8

this.defaultInitialRate = validateRate(defaultInitialRate);

this.weightingService = checkNotNull(weightingService);

}

}

Donʼt repeat yourself (DRY). Duplication can lead to maintenance nightmares, poor factoring, and logical contradictions.

Avoid unnecessary code.

/*AVO ID*/List<String> strings = fetchStrings();return strings;/*AVO ID*/List<String> strings = fetchStrings();return strings;/*PREFER*/return fetchStrings();/*PREFER*/return fetchStrings();

/*AVO ID*/

List<String> strings = fetchStrings();

return strings;

/*AVO ID*/

List<String> strings = fetchStrings();

return strings;

/*PREFER*/

return fetchStrings();

/*PREFER*/

return fetchStrings();

Prefer to return empty collections to null values.

Always use the @Override annotation if you are overwriting a Method.

SEA Project Code Conventions

In SEA - projects we have defined some conventions based on the architecture. Below you can see some of these rules:

General

Each new class must have included the @author annotation.  For static values you need to create constant types.

Avoid the use of method printStackTrace() for security issues.  Use Logger instead.

For the parameters of the Logger messages, you need to use the following notation:

1 log.info("Some message {}", someAttribute);1 log.info("Some message {}", someAttribute);

1 log.info("Some message {}", someAttribute);

1 log.info("Some message {}", someAttribute);

API Module

The request package must contain all the input POJO's for the controllers.

The response package must contain all the POJO's returned by the co-drivers.

Client Module

The configuration files must have the Config suffix.  Feign client classes must have the Client suffix.

Classes that feign annotation must contain the main path to persistence over classes, for

@RequestMapping(value = "/universities")@RequestMapping(value = "/universities")example,.

@RequestMapping(value = "/universities")

@RequestMapping(value = "/universities")

The domain package must contain the POJO's of interaction with fusion persistence.  Services classes must have the Service suffix.

Facades classes must have the Facade suffix.

The exception package must contain all the errors that persist and with the exception suffix.

Modules Module

This module contains the frameworks or large libraries.

Parent Module

This module is to deploy the artifacts it creates in the package phase of the build; it needs to define the repository information where the packaged artifacts will be deployed.

Service Module

The service module must contain all the REST endpoints and business logic. All controller classes must have the Controller suffix.

The paths of the controllers must have as a prefix the System name, for example:

/system/Folders , then the full path of the following structure:

/api/{service}/system/{pathController} .

In the controllers should be injected commands, and the names must be related to the controller.

Each endpoint must have included the @ApiOperation annotation with a description of the purpose of the endpoint.

It is required to include the validation annotations for each attribute requested in the endpoint.  In the endpoints that receive the body, the request models of the API module must be used,

with their respective validations if required.

The response of the endpoint should be built by ResourceBuilder (returning a single object) and ResourcesBuilder (returning a collection of objects).

All Commands classes must have the Cmd suffix. The Commands interact with the services of the client module to persist data to Fusion.

All custom exception classes must have the Exception suffix. All custom exception key strings must be defined in a constant.

All attributes of custom exceptions must be declared as final and serializable.  All configuration files must be allocated under the config package

All WebSocket classes with a specific payload must have the Event suffix. All WebSocket listener classes must have the Listener suffix.

In the bootstrap configuration file, you can only go to configurations that are not going to be externalizable.