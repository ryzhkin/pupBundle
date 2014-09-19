/**
 * @class Класс контрол - диалог сообщение
 * @author <a href="mailto:ryshkin@gmail.com">Dmitry Ryzhkin</a>
 *
 * @param options - параметры объекта
 * @param {string|DOM|penat.Control|Array} optionsCell.content - содержимое которое нужно добавить в создаваемый контрол.
 *                                                         Это может быть просто html строка, указатель на DOM объект, указатель на penat.Control объект или массив выше перечисленных объектов.
 *
 * @param {object} options.attr - аттрибуты dom объекта
 * @param {object} options.css  - стилевые настройки dom объекта
 * @constructor
 *
 * @example
 * // Создаем простое диалоговое окно с текстом
 * var msgDialog = new penat.Control.MsgDialog({
 *   content: 'Сюда можно добавить нужный Вам контент',
 *   onOk: function () {
 *     console.log('Здесь выполняем нужные действия при нажатии на кнопку "Ok" ');
 *   },
 *   onCancel: function () {
 *     console.log('Здесь выполняем нужные действия при нажатии на кнопку "Cancel" ');
 *   }
 * });
 * msgDialog.show();
 *
 *
 */
penat.Control.MsgDialog = function (options) {
    var options = jQuery().extend(true, {
        content: null,
        html : '',
        attr: {
        },  // атрибуты нового элемента ui-widget-content  ui-corner-all
        css: {
            display: 'none',
            padding: '10px',
            background: '#FFFFFF',
            /*minWidth:   '200px',
             minHeight: '100px',*/
            cssFloat: 'left',
            position: 'fixed',
            top: '50%',
            left: '50%',
            zIndex: '99999',
            boxShadow: '0px 0px 20px #666'
        },    // стилевые настройки нового элемента
        backgroundOpacity: '0.6',
        backgroundColor: '#000000',
        closeOnBackgroundClick: false
    }, options);




    var contentPanel = new penat.Control('div', {
        content: options.content,
        css: {
            width: '100%',
            height: '100%',
            verticalAlign: 'top'
        }
    });


    options.content = null;
    penat.Control.call(this, 'div', options);

    var fadePanel = new penat.Control('div', {
        css: {
            display: 'none',
            background: options.backgroundColor, //'#666',
            position: 'fixed',
            left: '0px',
            top: '0px',
            width: '100%',
            height: '100%',
            opacity: options.backgroundOpacity,
            zIndex: '9999'
        },
        events: {
            onclick: function () {
              if (options.closeOnBackgroundClick == true) {
                if (typeof(options.onCancel) == 'function') {
                  options.onCancel();
                }
                this.hide();
              }
            }.bind(this)
        }

    });

    jQuery('body').append(fadePanel.dom);
    jQuery('body').append(this.dom);
    /*var contentPanel = new penat.Control('div', {
     content: content,
     css: {
     width: '100%',
     height: '100%'
     }
     });*/
    this.add(contentPanel);


    /**
     * Метод добавляет дочерний объект
     * @param {DOM, penat.Control, string, Array} obj - указатель на элемент в контексте DOM модели браузера или указатель на экземпляр объекта вида penat.Control или строка или массив объектов для добавления
     */
    this.add = function (obj) {
        contentPanel.add(obj)
    }

    /**
     * Метод удаляет все дочерние объекты из диалога
     */
    this.clear = function () {
        contentPanel.clear();
    }

    /**
     * Скрывает диалоговое окно
     */
    this.hide = function () {
        jQuery(this.dom).fadeOut();
        jQuery(fadePanel.dom).fadeOut();
    }

    /**
     * Показывает диалоговое окно
     * @param {object} options - параметры метода
     * @param {string|DOM|penat.Control|Array} showOptions.content - содержимое которое нужно добавить в создаваемый контрол.
     *                                                               Это может быть просто html строка, указатель на DOM объект, указатель на penat.Control объект или массив выше перечисленных объектов.
     * @param {object} showOptions.params - набор параметров, которые передаются в события onClick и onCancel
     */
    this.show = function (options) {
        this.options = jQuery().extend(true, {
            content: null
        }, options);
        if (this.options.content !== null) {
            contentPanel.clear();
            contentPanel.add(this.options.content);
        }
        jQuery(this.dom).fadeIn();
        jQuery(fadePanel.dom).css({'filter' : 'alpha(opacity=80)'}).fadeIn();
        jQuery(this.dom).css({
            'margin-top' : -((jQuery(this.dom).height() + 10) / 2),
            'margin-left' : -((jQuery(this.dom).width() + 10) / 2)
        });
    }



}


