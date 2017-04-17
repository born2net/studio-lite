/**
 * Created by maor.frankel on 5/25/15.
 */
ruler.prototype.utils = {
    extend: function extend(){
        for(var i=1; i< arguments.length; i++)
            for(var key in arguments[i])
                if(arguments[i].hasOwnProperty(key))
                    arguments[0][key] = arguments[i][key];
        return arguments[0];
    },
    pixelize: function (val){
        return val + 'px';
    },
    prependChild: function (container, element){
        return container.insertBefore(element,container.firstChild);
    },
    addClasss: function (element, classNames){
        if(!(classNames instanceof Array))
        {
            classNames = [classNames];
        }

        classNames.forEach(function (name){
            element.className += ' ' + name;
        });

        return element;

    },
    removeClasss: function (element, classNames){
        var curCalsss = element.className;
        if(!(classNames instanceof Array))
        {
            classNames = [classNames];
        }

        classNames.forEach(function (name){
            curCalsss = curCalsss.replace(name, '');
        });
        element.className = curCalsss;
        return element;

    }
} ;
