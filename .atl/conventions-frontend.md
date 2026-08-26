11.1 [Frontend]

Framework Angular

File naming

-- Use a hyphensymbol to name a file with multiple words.

-

-

/* WRONG */file name: scuUniversity. component. tsfile name: scuUniversity. component. htmlfile name: scuUniversity. component. scss/* WRONG */file name: scuUniversity. component. tsfile name: scuUniversity. component. htmlfile name: scuUniversity. component. scss/* CORRECT */file name: scu-university. component. tsfile name: scu-university. component. htmlfile name: scu-university. component. scss/* CORRECT */file name: scu-university. component. tsfile name: scu-university. component. htmlfile name: scu-university. component. scss

/* WRONG */

file name: scuUniversity. component. ts

file name: scuUniversity. component. html

file name: scuUniversity. component. scss

/* WRONG */

file name: scuUniversity. component. ts

file name: scuUniversity. component. html

file name: scuUniversity. component. scss

/* CORRECT */

file name: scu-university. component. ts

file name: scu-university. component. html

file name: scu-university. component. scss

/* CORRECT */

file name: scu-university. component. ts

file name: scu-university. component. html

file name: scu-university. component. scss

Use a defined prefix to name your files.

/* WRONG */file name: avatar. component. tsfile name: message. component. tsfile name: scroll. directive. ts/* WRONG */file name: avatar. component. tsfile name: message. component. tsfile name: scroll. directive. ts/* CORRECT */file name: scu-avatar. component. tsfile name: scu-message. component. tsfile name: scu-scroll. directive. ts/* CORRECT */file name: scu-avatar. component. tsfile name: scu-message. component. tsfile name: scu-scroll. directive. ts

/* WRONG */

file name: avatar. component. ts

file name: message. component. ts

file name: scroll. directive. ts

/* WRONG */

file name: avatar. component. ts

file name: message. component. ts

file name: scroll. directive. ts

/* CORRECT */

file name: scu-avatar. component. ts

file name: scu-message. component. ts

file name: scu-scroll. directive. ts

/* CORRECT */

file name: scu-avatar. component. ts

file name: scu-message. component. ts

file name: scu-scroll. directive. ts

Note: Let us use “scu” prefix which means Sea Core University as an example.

Components

*. component. ts*. component. ts. component. component Usesuffix to declare a component.

*. component. ts

*. component. ts

. component

. component

1 file name: scu-avatar. component. ts1 file name: scu-avatar. component. ts

1 file name: scu-avatar. component. ts

1 file name: scu-avatar. component. ts

camelCasecamelCase The selector should be the same as the class name replacing

camelCase

camelCase

with a hyphen and omitting the

suffix.

file name: scu-avatar. component. tsselector: <scu-avatar>file name: scu-avatar. component. tsselector: <scu-avatar>

file name: scu-avatar. component. ts

selector: <scu-avatar>

file name: scu-avatar. component. ts

selector: <scu-avatar>

The name must not be redundant and tied to a specific HTML tag, it should be a plural context if the component is for list items and singular if the context is an item.

/* WRONG */file name: scu-messages-list. component. tsfile name: scu-message-item. component. ts/* WRONG */file name: scu-messages-list. component. tsfile name: scu-message-item. component. ts/* CORRECT */file name: scu-messages. component. tsfile name: scu-message. component. ts/* CORRECT */file name: scu-messages. component. tsfile name: scu-message. component. ts

/* WRONG */

file name: scu-messages-list. component. ts

file name: scu-message-item. component. ts

/* WRONG */

file name: scu-messages-list. component. ts

file name: scu-message-item. component. ts

/* CORRECT */

file name: scu-messages. component. ts

file name: scu-message. component. ts

/* CORRECT */

file name: scu-messages. component. ts

file name: scu-message. component. ts

Services

HTTP service

*. http. ts*. http. tsrequestrequest Usesuffix to declare an HTTP service.

*. http. ts

*. http. ts

request

request

1 file name: scu-create-university. http. ts1 file name: scu-create-university. http. ts

1 file name: scu-create-university. http. ts

1 file name: scu-create-university. http. ts

You can define a method to subscribe to a request using theword.

private _initialize() : void {. . .this. _loadUniversitiesHttpRequest() ;. . .5 }private _initialize() : void {. . .this. _loadUniversitiesHttpRequest() ;. . .5 }

private _initialize() : void {

. . .

this. _loadUniversitiesHttpRequest() ;

. . .

5 }

private _initialize() : void {

. . .

this. _loadUniversitiesHttpRequest() ;

. . .

5 }

General Proposal

*. service. ts*. service. ts Usesuffix to declare a service.

*. service. ts

*. service. ts

1 file name: scu-startup. service. ts1 file name: scu-startup. service. ts

1 file name: scu-startup. service. ts

1 file name: scu-startup. service. ts

Directives

*. directive. ts*. directive. tsDirectiveDirective Usesuffix to declare a directive.

*. directive. ts

*. directive. ts

Directive

Directive

1 file name: scu-text-format. directive. ts1 file name: scu-text-format. directive. ts

1 file name: scu-text-format. directive. ts

1 file name: scu-text-format. directive. ts

The selector should be the same as the class name omitting thesuffix.

file name: scu-text-format. directive. tsselector: [ scuTextFormat]file name: scu-text-format. directive. tsselector: [ scuTextFormat]

file name: scu-text-format. directive. ts

selector: [ scuTextFormat]

file name: scu-text-format. directive. ts

selector: [ scuTextFormat]

Pipes

*. pipe. ts*. pipe. ts Usesuffix to declare a pipe.

*. pipe. ts

*. pipe. ts

1 file name: scu-date-format. pipe. ts1 file name: scu-date-format. pipe. ts

1 file name: scu-date-format. pipe. ts

1 file name: scu-date-format. pipe. ts

Enums

*. enum. ts*. enum. ts Usesuffix to declare an enum.

*. enum. ts

*. enum. ts

1 file name: scu-syllabus-type. enum. ts1 file name: scu-syllabus-type. enum. ts

1 file name: scu-syllabus-type. enum. ts

1 file name: scu-syllabus-type. enum. ts

Constants

*. constant. ts*. constant. ts Usesuffix to declare a constant.

*. constant. ts

*. constant. ts

1 file name: scu-syllabus. constant. ts1 file name: scu-syllabus. constant. ts

1 file name: scu-syllabus. constant. ts

1 file name: scu-syllabus. constant. ts

Redux NGXS

//TODO This content is pending for now.

Commands

*. cmd. ts*. cmd. ts Usesuffix to declare a command.

*. cmd. ts

*. cmd. ts

Commands have a unique purpose.

file name: scu-university-create. cmd. tsWhere: [ prefix] -[ component] -[ action] . cmd. tsfile name: scu-university-create. cmd. tsWhere: [ prefix] -[ component] -[ action] . cmd. ts

file name: scu-university-create. cmd. ts

Where: [ prefix] -[ component] -[ action] . cmd. ts

file name: scu-university-create. cmd. ts

Where: [ prefix] -[ component] -[ action] . cmd. ts

Access modifiers [Public and Private] Declarations

Use always an access modifier to define a variable or method.

__ Private variables or methods should be named withas a prefix.

_

_

The order should be: public variables first, then private variables.

The order should be: public methods first, then private methods.

Group variables whenever possible according to the proposal.

Life cycle methods donʼt have an access modifier specified.

Variables with immutable values should be declared as readonly .

Declare your variable and instantiate its value in the constructor or a life cycle method.

ngOnInitngOnInitlife cycle method should have only a call for one method, that is a private _initialize .

ngOnInit

ngOnInit

ngOnDestroyngOnDestroylife cycle method should have only a call for one method, that is a private _finalize .

ngOnDestroy

ngOnDestroy

12345678910111213141516171819202122232425262728293031323334353637public user: User;public isAdmin: boolean;public readonly userType: string = SCU. USER. DEFAULT;private _selectedUser: User;private readonly _TYPE: boolean = SCU. TYPE. ADMIN;constructor() {this. user = new User() ;this. isAdmin= false;this. _selectedUser = new User() ;}public ngOnInit() : void {this. _initialize() ;}public ngOnDestroy() : void {this. _finalize() ;}public send() : void {. . .}private _initialize() : void {. . .}private _finalize() : void {. . .}private _validate(condition: boolean) : void {12345678910111213141516171819202122232425262728293031323334353637public user: User;public isAdmin: boolean;public readonly userType: string = SCU. USER. DEFAULT;private _selectedUser: User;private readonly _TYPE: boolean = SCU. TYPE. ADMIN;constructor() {this. user = new User() ;this. isAdmin= false;this. _selectedUser = new User() ;}public ngOnInit() : void {this. _initialize() ;}public ngOnDestroy() : void {this. _finalize() ;}public send() : void {. . .}private _initialize() : void {. . .}private _finalize() : void {. . .}private _validate(condition: boolean) : void {

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

27

28

29

30

31

32

33

34

35

36

37

public user: User;

public isAdmin: boolean;

public readonly userType: string = SCU. USER. DEFAULT;

private _selectedUser: User;

private readonly _TYPE: boolean = SCU. TYPE. ADMIN;

constructor() {

this. user = new User() ;

this. isAdmin= false;

this. _selectedUser = new User() ;

}

public ngOnInit() : void {

this. _initialize() ;

}

public ngOnDestroy() : void {

this. _finalize() ;

}

public send() : void {

. . .

}

private _initialize() : void {

. . .

}

private _finalize() : void {

. . .

}

private _validate(condition: boolean) : void {

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

25

26

27

28

29

30

31

32

33

34

35

36

37

public user: User;

public isAdmin: boolean;

public readonly userType: string = SCU. USER. DEFAULT;

private _selectedUser: User;

private readonly _TYPE: boolean = SCU. TYPE. ADMIN;

constructor() {

this. user = new User() ;

this. isAdmin= false;

this. _selectedUser = new User() ;

}

public ngOnInit() : void {

this. _initialize() ;

}

public ngOnDestroy() : void {

this. _finalize() ;

}

public send() : void {

. . .

}

private _initialize() : void {

. . .

}

private _finalize() : void {

. . .

}

private _validate(condition: boolean) : void {

38. . .39 }38. . .39 }

38. . .

39 }

38. . .

39 }

Lifecycle hooks implementation

Implementation should follow the following order for methods and implement instruction: OnInit, . . . , OnDestroy .

12345678910111213141516171819. . .export class ScuCoursePanelComponent implements OnInit, AfterViewInit, OnDestroy {constructor() {. . .}public ngOnInit() : void {. . .}public ngAfterViewInit() : void {. . .}public ngOnDestroy() : void {. . .}}12345678910111213141516171819. . .export class ScuCoursePanelComponent implements OnInit, AfterViewInit, OnDestroy {constructor() {. . .}public ngOnInit() : void {. . .}public ngAfterViewInit() : void {. . .}public ngOnDestroy() : void {. . .}}

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

. . .

export class ScuCoursePanelComponent implements OnInit, AfterViewInit, OnDestroy {

constructor() {

. . .

}

public ngOnInit() : void {

. . .

}

public ngAfterViewInit() : void {

. . .

}

public ngOnDestroy() : void {

. . .

}

}

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

. . .

export class ScuCoursePanelComponent implements OnInit, AfterViewInit, OnDestroy {

constructor() {

. . .

}

public ngOnInit() : void {

. . .

}

public ngAfterViewInit() : void {

. . .

}

public ngOnDestroy() : void {

. . .

}

}

Methods / Functions members

Each declaration should have specified its type unless tslint will be able to fetch it.

private _myMethod() : void {const myVariable: User = new User() ;const scroll: { size: number, color: string } = { 10, ' red' };4 }private _myMethod() : void {const myVariable: User = new User() ;const scroll: { size: number, color: string } = { 10, ' red' };4 }

private _myMethod() : void {

const myVariable: User = new User() ;

const scroll: { size: number, color: string } = { 10, ' red' };

4 }

private _myMethod() : void {

const myVariable: User = new User() ;

const scroll: { size: number, color: string } = { 10, ' red' };

4 }

Inputs and Outputs

The declaration should be in one line.

Outputs need to have a prefix selector of the directive/component in lowerCamelCase. These apply more when a directive/component will be exported and used by a solution developer.

The variables that use an angular annotation should be in the first line after the class name.

1 export class ScuScrollActionDirective implements OnInit, OnDestroy { 2@Output() public scuOnBottom: EventEmitter<void>;@Input() public scuScrollElement: HTMLElement;. . .6constructor() {}9 }1 export class ScuScrollActionDirective implements OnInit, OnDestroy { 2@Output() public scuOnBottom: EventEmitter<void>;@Input() public scuScrollElement: HTMLElement;. . .6constructor() {}9 }

1 export class ScuScrollActionDirective implements OnInit, OnDestroy { 2

@Output() public scuOnBottom: EventEmitter<void>;

@Input() public scuScrollElement: HTMLElement;

. . .

6

constructor() {

}

9 }

1 export class ScuScrollActionDirective implements OnInit, OnDestroy { 2

@Output() public scuOnBottom: EventEmitter<void>;

@Input() public scuScrollElement: HTMLElement;

. . .

6

constructor() {

}

9 }

Typescript

General Types

Donʼt ever use types Number, String, Boolean, or Object . These types refer to non-primitive boxed objects that are almost never used appropriately in JavaScript code.

/* WRONG */public variable: String;public isCorrect: Boolean;/* WRONG */public variable: String;public isCorrect: Boolean;/* CORRECT */public variable: string;public isCorrect: boolean;/* CORRECT */public variable: string;public isCorrect: boolean;

/* WRONG */

public variable: String;

public isCorrect: Boolean;

/* WRONG */

public variable: String;

public isCorrect: Boolean;

/* CORRECT */

public variable: string;

public isCorrect: boolean;

/* CORRECT */

public variable: string;

public isCorrect: boolean;

Name of Classes

PascalCasePascalCasecamelCasecamelCase Usefor class names.

PascalCase

PascalCase

camelCase

camelCase

/* WRONG */public class awesomeClass { }/* WRONG */public class awesomeClass { }/* CORRECT */public class AwesomeClass { }/* CORRECT */public class AwesomeClass { }

/* WRONG */

public class awesomeClass { }

/* WRONG */

public class awesomeClass { }

/* CORRECT */

public class AwesomeClass { }

/* CORRECT */

public class AwesomeClass { }

Usefor class members and methods.

/* WRONG */public class AwesomeClass {public Variable: number;public MyMethod() : void {. . .6}7 }/* WRONG */public class AwesomeClass {public Variable: number;public MyMethod() : void {. . .6}7 }/* CORRECT */public class AwesomeClass {public variable: number;public myMethod() : void {. . .}7 }/* CORRECT */public class AwesomeClass {public variable: number;public myMethod() : void {. . .}7 }

/* WRONG */

public class AwesomeClass {

public Variable: number;

public MyMethod() : void {

. . .

6}

7 }

/* WRONG */

public class AwesomeClass {

public Variable: number;

public MyMethod() : void {

. . .

6}

7 }

/* CORRECT */

public class AwesomeClass {

public variable: number;

public myMethod() : void {

. . .

}

7 }

/* CORRECT */

public class AwesomeClass {

public variable: number;

public myMethod() : void {

. . .

}

7 }

Interfaces

Use

Use

for the name.

PascalCasePascalCasecamelCasecamelCasefor members.

PascalCase

PascalCase

camelCase

camelCase

Donʼt use a prefix with I .

/* WRONG */interface iTest {VariableWithValue: string;4 }/* WRONG */interface iTest {VariableWithValue: string;4 }/* CORRECT */interface Test {variableWithValue: string;/* CORRECT */interface Test {variableWithValue: string;

/* WRONG */

interface iTest {

VariableWithValue: string;

4 }

/* WRONG */

interface iTest {

VariableWithValue: string;

4 }

/* CORRECT */

interface Test {

variableWithValue: string;

/* CORRECT */

interface Test {

variableWithValue: string;

4 }4 }

4 }

4 }

Namespaces

PascalCasePascalCaseUsefor the name.

PascalCase

PascalCase

/* WRONG */export namespace myNameSpace {. . .4 }/* WRONG */export namespace myNameSpace {. . .4 }/* CORRECT */export namespace MyNameSpace {. . .}/* CORRECT */export namespace MyNameSpace {. . .}

/* WRONG */

export namespace myNameSpace {

. . .

4 }

/* WRONG */

export namespace myNameSpace {

. . .

4 }

/* CORRECT */

export namespace MyNameSpace {

. . .

}

/* CORRECT */

export namespace MyNameSpace {

. . .

}

Enums

PascalCasePascalCase Usefor the name.

PascalCase

PascalCase

PascalCasePascalCase Usefor enum members.

PascalCase

PascalCase

/* WRONG */export enum color {red = ' red'4 }/* WRONG */export enum color {red = ' red'4 }/* CORRECT */export enum Color {Red = ' red'4 }/* CORRECT */export enum Color {Red = ' red'4 }

/* WRONG */

export enum color {

red = ' red'

4 }

/* WRONG */

export enum color {

red = ' red'

4 }

/* CORRECT */

export enum Color {

Red = ' red'

4 }

/* CORRECT */

export enum Color {

Red = ' red'

4 }

Constants

uppercaseuppercase Usefor definition and members.

uppercase

uppercase

__ Use underscorefor multiple words.

_

_

/* WRONG */const ScuNotify = {Success: ' success message' ,Warning: ' warning message'5 }/* WRONG */const ScuNotify = {Success: ' success message' ,Warning: ' warning message'5 }/* CORRECT */const SCU_NOTIFY = {SUCCESS: ' success message' ,WARNING: ' warning message'5 }/* CORRECT */const SCU_NOTIFY = {SUCCESS: ' success message' ,WARNING: ' warning message'5 }

/* WRONG */

const ScuNotify = {

Success: ' success message' ,

Warning: ' warning message'

5 }

/* WRONG */

const ScuNotify = {

Success: ' success message' ,

Warning: ' warning message'

5 }

/* CORRECT */

const SCU_NOTIFY = {

SUCCESS: ' success message' ,

WARNING: ' warning message'

5 }

/* CORRECT */

const SCU_NOTIFY = {

SUCCESS: ' success message' ,

WARNING: ' warning message'

5 }

Formatting

Same as tsfmt Typescript Formatter defaults.

/* WRONG */const foo: string = " hello";const foo: string=" hello";45 if(isDeleted) {/* WRONG */const foo: string = " hello";const foo: string=" hello";45 if(isDeleted) {

/* WRONG */

const foo: string = " hello";

const foo: string=" hello";

4

5 if(isDeleted) {

/* WRONG */

const foo: string = " hello";

const foo: string=" hello";

4

5 if(isDeleted) {

. . .}89ngOnDestroy() : void{. . .}. . .}89ngOnDestroy() : void{. . .}

. . .

}

8

9

ngOnDestroy() : void{

. . .

}

. . .

}

8

9

ngOnDestroy() : void{

. . .

}

12345678910/* CORRECT */const foo: string = ' hello' ;if (isDeleted) {. . .}public ngOnDestroy() : void {. . .}12345678910/* CORRECT */const foo: string = ' hello' ;if (isDeleted) {. . .}public ngOnDestroy() : void {. . .}

1

2

3

4

5

6

7

8

9

10

/* CORRECT */

const foo: string = ' hello' ;

if (isDeleted) {

. . .

}

public ngOnDestroy() : void {

. . .

}

1

2

3

4

5

6

7

8

9

10

/* CORRECT */

const foo: string = ' hello' ;

if (isDeleted) {

. . .

}

public ngOnDestroy() : void {

. . .

}

Null vs Undefined

Prefer not to use either for explicit unavailability

/* WRONG */const something = {3x: 123,4y: undefined5 };/* WRONG */const something = {3x: 123,4y: undefined5 };/* CORRECT */const something: {x: number, y?: number} = {3x: 1234 };/* CORRECT */const something: {x: number, y?: number} = {3x: 1234 };

/* WRONG */

const something = {

3x: 123,

4y: undefined

5 };

/* WRONG */

const something = {

3x: 123,

4y: undefined

5 };

/* CORRECT */

const something: {x: number, y?: number} = {

3x: 123

4 };

/* CORRECT */

const something: {x: number, y?: number} = {

3x: 123

4 };

Use undefined . Do not use null .

/* WRONG */return null;/* WRONG */return null;/* CORRECT */return undefined;/* CORRECT */return undefined;

/* WRONG */

return null;

/* WRONG */

return null;

/* CORRECT */

return undefined;

/* CORRECT */

return undefined;

Useonly where it's a part of the API or conventional.

/* WRONG */cb(undefined)/* WRONG */cb(undefined)/* CORRECT */cb(null)/* CORRECT */cb(null)

/* WRONG */

cb(undefined)

/* WRONG */

cb(undefined)

/* CORRECT */

cb(null)

/* CORRECT */

cb(null)

nullnullQuotes

null

null

'' Use single quotes.

'

'

/* WRONG */public readonly myMessage = " Please type here";/* WRONG */public readonly myMessage = " Please type here";1 /* CORRECT */1 /* CORRECT */

/* WRONG */

public readonly myMessage = " Please type here";

/* WRONG */

public readonly myMessage = " Please type here";

1 /* CORRECT */

1 /* CORRECT */

2 public readonly myMessage = ' Please type here' ;2 public readonly myMessage = ' Please type here' ;

2 public readonly myMessage = ' Please type here' ;

2 public readonly myMessage = ' Please type here' ;

White Spaces

Use 2 spaces to indent, not tabs.

Template literals

Use template literals when you need to join string values with variable values.

/* WRONG */return ' /topic/student/' + this. _studentId;/* WRONG */return ' /topic/student/' + this. _studentId;/* CORRECT */return ` /topic/student/${this. _studentId}` ;/* CORRECT */return ` /topic/student/${this. _studentId}` ;

/* WRONG */

return ' /topic/student/' + this. _studentId;

/* WRONG */

return ' /topic/student/' + this. _studentId;

/* CORRECT */

return ` /topic/student/${this. _studentId}` ;

/* CORRECT */

return ` /topic/student/${this. _studentId}` ;

Semicolon and comma

Semicolons

Use semicolons to end every code line instruction.

/* WRONG */public declaration: string/* WRONG */public declaration: string/* CORRECT */public declaration: string;/* CORRECT */public declaration: string;

/* WRONG */

public declaration: string

/* WRONG */

public declaration: string

/* CORRECT */

public declaration: string;

/* CORRECT */

public declaration: string;

Trailing comma

Avoid using it for arrays definition and objects literal.

/* WRONG */const myArray: string[ ] = [ ' 1' , ' 2' , ' 3' , ] ;const myObject: {a: string, b: string} = {a: ' hello' ,b: ' bye' ,6 };/* WRONG */const myArray: string[ ] = [ ' 1' , ' 2' , ' 3' , ] ;const myObject: {a: string, b: string} = {a: ' hello' ,b: ' bye' ,6 };/* CORRECT */const myArray: string[ ] = [ ' 1' , ' 2' , ' 3' ] ;const myObject: {a: string, b: string} = {a: ' hello' ,b: ' bye'6 };7/* CORRECT */const myArray: string[ ] = [ ' 1' , ' 2' , ' 3' ] ;const myObject: {a: string, b: string} = {a: ' hello' ,b: ' bye'6 };7

/* WRONG */

const myArray: string[ ] = [ ' 1' , ' 2' , ' 3' , ] ;

const myObject: {a: string, b: string} = {

a: ' hello' ,

b: ' bye' ,

6 };

/* WRONG */

const myArray: string[ ] = [ ' 1' , ' 2' , ' 3' , ] ;

const myObject: {a: string, b: string} = {

a: ' hello' ,

b: ' bye' ,

6 };

/* CORRECT */

const myArray: string[ ] = [ ' 1' , ' 2' , ' 3' ] ;

const myObject: {a: string, b: string} = {

a: ' hello' ,

b: ' bye'

6 };

7

/* CORRECT */

const myArray: string[ ] = [ ' 1' , ' 2' , ' 3' ] ;

const myObject: {a: string, b: string} = {

a: ' hello' ,

b: ' bye'

6 };

7

Arrays

foos: Foo[ ] ;foos: Foo[ ] ;foos: Array<Foo>;foos: Array<Foo>;Annotate arrays asinstead of.

foos: Foo[ ] ;

foos: Foo[ ] ;

foos: Array<Foo>;

foos: Array<Foo>;

Callback Types

anyanyDonʼt use the return typefor callbacks whose value will be ignored.

any

any

voidvoidUsingis safer because it prevents you from accidentally using the return value of x in an unchecked way.

void

void

1 /* WRONG */1 /* WRONG */

1 /* WRONG */

1 /* WRONG */

2 public myMethod(x: () => any) : void {3x() ;4 }2 public myMethod(x: () => any) : void {3x() ;4 }

2 public myMethod(x: () => any) : void {

3x() ;

4 }

2 public myMethod(x: () => any) : void {

3x() ;

4 }

/* CORRECT */public myMethod(x: () => void) : void {3x() ;4 }/* CORRECT */public myMethod(x: () => void) : void {3x() ;4 }

/* CORRECT */

public myMethod(x: () => void) : void {

3x() ;

4 }

/* CORRECT */

public myMethod(x: () => void) : void {

3x() ;

4 }

Optional parameters

Donʼt write several overloads that differ only in trailing parameters.

/* WRONG */export interface Test {run(one: string) : number;run(one: string, two: string) : number;run(one: string, two: string, three: boolean) : number;6 }/* WRONG */export interface Test {run(one: string) : number;run(one: string, two: string) : number;run(one: string, two: string, three: boolean) : number;6 }/* CORRECT */export interface Test {run(one: string, two?: string, three?: boolean) : number;4 }/* CORRECT */export interface Test {run(one: string, two?: string, three?: boolean) : number;4 }

/* WRONG */

export interface Test {

run(one: string) : number;

run(one: string, two: string) : number;

run(one: string, two: string, three: boolean) : number;

6 }

/* WRONG */

export interface Test {

run(one: string) : number;

run(one: string, two: string) : number;

run(one: string, two: string, three: boolean) : number;

6 }

/* CORRECT */

export interface Test {

run(one: string, two?: string, three?: boolean) : number;

4 }

/* CORRECT */

export interface Test {

run(one: string, two?: string, three?: boolean) : number;

4 }

Union Types

Donʼt write overloads that differ by type in only one argument position.

union typesunion typesUsewhenever possible.

union types

union types

/* WRONG */export interface Moment {utcOffset() : number;utcOffset(b: number) : Moment;utcOffset(b: string) : Moment;6 }/* WRONG */export interface Moment {utcOffset() : number;utcOffset(b: number) : Moment;utcOffset(b: string) : Moment;6 }/* CORRECT */export interface Moment {utcOffset() : number;utcOffset(b: number | string) : Moment;5 }/* CORRECT */export interface Moment {utcOffset() : number;utcOffset(b: number | string) : Moment;5 }

/* WRONG */

export interface Moment {

utcOffset() : number;

utcOffset(b: number) : Moment;

utcOffset(b: string) : Moment;

6 }

/* WRONG */

export interface Moment {

utcOffset() : number;

utcOffset(b: number) : Moment;

utcOffset(b: string) : Moment;

6 }

/* CORRECT */

export interface Moment {

utcOffset() : number;

utcOffset(b: number | string) : Moment;

5 }

/* CORRECT */

export interface Moment {

utcOffset() : number;

utcOffset(b: number | string) : Moment;

5 }

interfaceinterfaceextendsextendsimplementsimplementsExtends and Implements

interface

interface

extends

extends

implements

implements

Use the

when you want to

or

it whenever possible.

12345678910export interface Foo {public foo: string;}export interface FooBar extends Foo {public bar: string;}export class X implements FooBar {public foo: string;12345678910export interface Foo {public foo: string;}export interface FooBar extends Foo {public bar: string;}export class X implements FooBar {public foo: string;

1

2

3

4

5

6

7

8

9

10

export interface Foo {

public foo: string;

}

export interface FooBar extends Foo {

public bar: string;

}

export class X implements FooBar {

public foo: string;

1

2

3

4

5

6

7

8

9

10

export interface Foo {

public foo: string;

}

export interface FooBar extends Foo {

public bar: string;

}

export class X implements FooBar {

public foo: string;

11public bar: string;12 }11public bar: string;12 }

11public bar: string;

12 }

11public bar: string;

12 }

HTML

File Structure

articlearticlesectionsectionThe structure definition for HTML files should be like the following:

article

article

section

section

Whenever possible use

and

elements.

divdiv You can useelements when you need to decorate some element.

div

div

conditionalsconditionalsor loop structures ,or loop structures , The order of attributes for an element will be first class , element properties,

conditionals

conditionals

or loop structures ,

or loop structures ,

ngModel,ngModel,animations , inputs ,and outputs .

ngModel,

ngModel,

It is required always to close an element, even if is declared in one.

123456789101112131415161718192021222324<div class="scu- ui- scroll- container"><article class="scu- university- container scu- university- container- preset"id="scu- university"*ngIf="scuUniversityItem" [ @univeristyItemFadeIn][ ngClass] ="{' scu- university- container- no- divider' : ! showDividerLine}" [ (ngModel) ] ="user. email"(click) ="openUniversity() "><section class="scu- university- left- panel">. . .</section><section class="scu- university- center- panel">. . .</section><section class="scu- university- right- panel">. . .</section></article></div>123456789101112131415161718192021222324<div class="scu- ui- scroll- container"><article class="scu- university- container scu- university- container- preset"id="scu- university"*ngIf="scuUniversityItem" [ @univeristyItemFadeIn][ ngClass] ="{' scu- university- container- no- divider' : ! showDividerLine}" [ (ngModel) ] ="user. email"(click) ="openUniversity() "><section class="scu- university- left- panel">. . .</section><section class="scu- university- center- panel">. . .</section><section class="scu- university- right- panel">. . .</section></article></div>

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

<div class="scu- ui- scroll- container">

<article class="scu- university- container scu- university- container- preset"

id="scu- university"

*ngIf="scuUniversityItem" [ @univeristyItemFadeIn]

[ ngClass] ="{' scu- university- container- no- divider' : ! showDividerLine}" [ (ngModel) ] ="user. email"

(click) ="openUniversity() ">

<section class="scu- university- left- panel">

. . .

</section>

<section class="scu- university- center- panel">

. . .

</section>

<section class="scu- university- right- panel">

. . .

</section>

</article>

</div>

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

21

22

23

24

<div class="scu- ui- scroll- container">

<article class="scu- university- container scu- university- container- preset"

id="scu- university"

*ngIf="scuUniversityItem" [ @univeristyItemFadeIn]

[ ngClass] ="{' scu- university- container- no- divider' : ! showDividerLine}" [ (ngModel) ] ="user. email"

(click) ="openUniversity() ">

<section class="scu- university- left- panel">

. . .

</section>

<section class="scu- university- center- panel">

. . .

</section>

<section class="scu- university- right- panel">

. . .

</section>

</article>

</div>

Accessibility

We need to ensure that we will apply the correct semantic using HTML 5 according to the case.

<! -- WRONG -- ><div>Click me</div>. . .<div>. . .<div>. . . </div><div>. . . </div></div><! -- WRONG -- ><div>Click me</div>. . .<div>. . .<div>. . . </div><div>. . . </div></div><! -- CORRECT -- ><button type="button">Click me</button> 3<! -- CORRECT -- ><button type="button">Click me</button> 3

<! -- WRONG -- >

<div>Click me</div>

. . .

<div>

. . .

<div>. . . </div>

<div>. . . </div>

</div>

<! -- WRONG -- >

<div>Click me</div>

. . .

<div>

. . .

<div>. . . </div>

<div>. . . </div>

</div>

<! -- CORRECT -- >

<button type="button">Click me</button> 3

<! -- CORRECT -- >

<button type="button">Click me</button> 3

4 <article>5. . .6<section>. . . </section> 78<section>. . . </section> 910 </article>4 <article>5. . .6<section>. . . </section> 78<section>. . . </section> 910 </article>

4 <article>

5. . .

6<section>. . . </section> 7

8<section>. . . </section> 9

10 </article>

4 <article>

5. . .

6<section>. . . </section> 7

8<section>. . . </section> 9

10 </article>