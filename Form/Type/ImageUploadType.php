<?php
  namespace ryshkin\pupBundle\Form\Type;


  use Symfony\Component\Form\AbstractType;
  use Symfony\Component\Form\FormBuilderInterface;
  use Symfony\Component\Form\FormInterface;
  use Symfony\Component\Form\FormView;
  use Symfony\Component\OptionsResolver\Options;
  use Symfony\Component\OptionsResolver\OptionsResolverInterface;
  use Symfony\Component\Form\Extension\Core\Type\DateType as BaseDateType;


  class ImageUploadType extends AbstractType {
      /*private $options;

      public function __construct(array $options) {
        $this->options = $options;
      }*/

      public function buildForm (FormBuilderInterface $builder, array $options) {
         // $dateOptions = $builder->get('date')->getOptions();
         // $builder->remove('datetime')->add('datetime', 'bootstrapDateTimePicker', $dateOptions);
      }

      public function buildView(FormView $view, FormInterface $form, array $options) {
         $defaultOptions = array(
           'height'    => 150,
           'width'     => 150,
           'language'  => \Locale::getDefault(),
           'route'     => null,

           'srcRoute'  => 'uploads/orig/', // Путь где хранить исходные файлы, если пусто - исходные файлы не храним
           'dstRoute'  => 'uploads/',     // Путь где хранить загруженные и обработанные файлы
           'aspect'    => 1               // По-умолчанию вырезать только кадратную область
         );
         $defaultOptions = array_merge($defaultOptions, $options['pupOptions']);
         // \tool::xlog('picker', $defaultImageUploadOptions);


         $view->vars = array_replace($view->vars, array(
           'pupOptions' => $defaultOptions
         ));
      }

      public function setDefaultOptions(OptionsResolverInterface $resolver) {
        $resolver->setDefaults(array(
           'pupOptions' => array(),
        ));
      }

      public function getParent() {
          return 'text';
      }

      public function getName() {
          return 'pup';
      }
  }


