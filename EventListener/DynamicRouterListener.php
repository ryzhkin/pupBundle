<?php

namespace ryshkin\pupBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\EventListener\RouterListener;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Matcher\UrlMatcher;
use Symfony\Component\Routing\RequestContext;
use Symfony\Component\Routing\RouteCollection;
use Symfony\Component\Routing\Route;

class DynamicRouterListener extends RouterListener {
    /**
     * @var RouteCollection
     */
    protected $routes;
    protected $routesLoaded = false;

    function __construct() {
        $this->routes = new RouteCollection();
        parent::__construct(
            new UrlMatcher($this->routes, new RequestContext())
        );

        $this->loadRoutes();
    }

    protected function loadRoutes() {
        $this->routes->add(
            'dynamic_route_' . ($this->routes->count() + 1),
            new Route(
                'pup/image/upload/service',
                $defaults = array(
                  '_controller' => 'pupBundle:Process:upload'
                ),
                $requirements = array()
            )
        );

        //add another
        //or execute a db query and add multiple routes
        //etc.
    }

    public function onKernelRequest(GetResponseEvent $event) {
        if (false === $this->routesLoaded) {
          $this->loadRoutes($event->getRequest());
          $this->routesLoaded = true;
        }
        try {
            parent::onKernelRequest($event);
        } catch(NotFoundHttpException $e) {

        }
    }
}



?>