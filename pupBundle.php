<?php

namespace ryshkin\pupBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use ryshkin\pupBundle\DependencyInjection\Compiler\FormPass;

class pupBundle extends Bundle {
    public function build(ContainerBuilder $container) {
        parent::build($container);
        $container->addCompilerPass(new FormPass());
    }
}
