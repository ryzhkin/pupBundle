<?php

namespace ryshkin\pupBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

/**
 * Add a new twig.form.resources
 *
 */
class FormPass implements CompilerPassInterface {
    /**
     * {@inheritdoc}
     */
    public function process(ContainerBuilder $container) {
        $resources = $container->getParameter('twig.form.resources');
        $resources[] = 'pupBundle:Form:fields.html.twig';
        $container->setParameter('twig.form.resources', $resources);
    }
}
