<?php

namespace ryshkin\pupBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Acl\Exception\Exception;

class ProcessController extends Controller {


    /**
     * Загружаем фото в память для дальнейших манипуляций.
     * @param $filename - путь к файлу с фото.
     * @return null|resource - возвращает указатель на ресур вслучае успеха, в противном случае возвращает null
     */
    private function loadImage ($filename) {
        $img = null;
        $size = getimagesize($filename);
        switch ($size['mime']) {
            case 'image/jpeg':
                $img = imagecreatefromjpeg($filename);
                break;
            case 'image/png':
                $img = imagecreatefrompng($filename);
                break;
            case 'image/gif':
                $img = imagecreatefromgif($filename);
                break;
            default:
                $img = imagecreatefromjpeg($filename);
                break;
        }
        return ($img);
    }

    /**
     * Делает обрезание картинки + масштабирует полученный фрагмент изображения.
     * @param $srcImg - указатель на ресурс исходного изображения
     * @param $x      - x координата области для вырезания
     * @param $y      - y координата области для вырезания
     * @param $width  - ширина области для вырезания
     * @param $height - высота области для вырезания
     * @param null $newWidth  - новая ширина вырезанного фрагмента, если неуказано значение берется равным исходному
     * @param null $newHeight - новая высота вырезанного фрагмента, если неуказано значение берется равным исходному
     * @return null|resource  - в случае спеха возвращает указатель на новуе обрезанное и масштабированное изображение.
     */
    private function cropPhoto ($srcImg, $x, $y, $width, $height, $newWidth = null, $newHeight = null) {
        $img = null;
        if ($newWidth == null) {
            $newWidth = $width;
        }
        if ($newHeight == null) {
            $newHeight = $height;
        }
        $img = imagecreatetruecolor($newWidth, $newHeight);
        $result = imagecopyresampled($img, $srcImg, 0, 0, $x, $y, $newWidth, $newHeight, $width, $height);
        if ($result == false) {
            imagedestroy($img);
            return (null);
        }
        return ($img);
    }

    private function mb_str_replace($search, $replace, $subject, &$count = 0) {
        if (!is_array($subject))
        {
            $searches = is_array($search) ? array_values($search) : array($search);
            $replacements = is_array($replace) ? array_values($replace) : array($replace);
            $replacements = array_pad($replacements, count($searches), '');
            foreach ($searches as $key => $search)
            {
                $parts = mb_split(preg_quote($search), $subject);
                $count += count($parts) - 1;
                $subject = implode($replacements[$key], $parts);
            }
        }
        else
        {
            foreach ($subject as $key => $value)
            {
                $subject[$key] = mb_str_replace($search, $replace, $value, $count);
            }
        }
        return $subject;
    }

    private function transliterate ($st) {
        $cyr = array(
            'ж',  'ч',  'щ',   'ш',  'ю',  'а', 'б', 'в', 'г', 'д', 'e', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ъ', 'ь', 'я', 'ы',
            'Ж',  'Ч',  'Щ',   'Ш',  'Ю',  'А', 'Б', 'В', 'Г', 'Д', 'Е', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ъ', 'Ь', 'Я', 'Ы');
        $lat = array(
            'zh', 'ch', 'sht', 'sh', 'yu', 'a', 'b', 'v', 'g', 'd', 'e', 'z', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'c', 'y', 'x', 'ja', 'y',
            'Zh', 'Ch', 'Sht', 'Sh', 'Yu', 'A', 'B', 'V', 'G', 'D', 'E', 'Z', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'F', 'H', 'c', 'Y', 'X', 'JA', 'Y');
        return $this->mb_str_replace($cyr, $lat, $st);
    }

    private function pcgbasename($param, $suffix=null) {
        if ($suffix) {
            $tmpstr = ltrim(substr($param, strrpos($param, DIRECTORY_SEPARATOR) ), DIRECTORY_SEPARATOR);
            if ( (strpos($param, $suffix)+strlen($suffix) )  ==  strlen($param) ) {
                return str_ireplace( $suffix, '', $tmpstr);
            } else {
                return ltrim(substr($param, strrpos($param, DIRECTORY_SEPARATOR) ), DIRECTORY_SEPARATOR);
            }
        } else {
            return ltrim(substr($param, strrpos($param, DIRECTORY_SEPARATOR) ), DIRECTORY_SEPARATOR);
        }
    }

    private function getUnicFileName($dstRoute, $filename, $saveOrigFileName = false) {
      $path_info = pathinfo($filename);
      if ($saveOrigFileName !== false) {
        $c = count(glob($_SERVER["DOCUMENT_ROOT"].'/'.$dstRoute.$this->transliterate(basename($filename,'.'.$path_info['extension'])).'*'));
        return $this->transliterate(basename($filename,'.'.$path_info['extension'])).(($c == 0)?'':$c+1).'.'.strtolower($path_info['extension']);
      } else {
        return md5($filename.rand(1, 1024).\time()).'.'.strtolower($path_info['extension']);
      }
    }

    public function uploadAction (Request $request) {
        if ($request->isXmlHttpRequest() && $request->request->get('ajaxAction', null) !== null ) {
            $result = array();
            $result['ok'] = false;
            switch ($request->request->get('ajaxAction', null)) {
                case 'uploadURL': {
                  $srcRoute  = $request->request->get('srcRoute', '');
                  $dstRoute  = $request->request->get('dstRoute', 'uploads/');
                  $url       = $request->request->get('url', '');
                  $path_info = pathinfo($url);
                  if (isset($path_info['extension']) && in_array(strtolower($path_info['extension']), array('png', 'jpg', 'gif', 'jpeg'))) {
                   $photo = file_get_contents($url);
                   if ($photo !== FALSE) {
                     //$dst = $dstRoute.md5($url.\time()).'.'.strtolower($path_info['extension']);
                     $dst = $dstRoute.$this->getUnicFileName($dstRoute, $url);
                     file_put_contents($dst, $photo);
                     $result['ok']  = true;
                     $result['url'] = $dst;
                   }
                  }
                  //\tool::xlog('upload', $path_info);
                  break;
                }
                case 'upload': {
                  $srcRoute = $request->request->get('srcRoute', '');
                  $dstRoute = $request->request->get('dstRoute', 'uploads/');
                  $saveOrigFileName = $request->request->get('saveOrigFileName', false);
                  $file = $_FILES['qqfile'];
                  if ($file !== FALSE) {
                    $path_info = pathinfo($file['name']);
                    if  ((isset($path_info['extension']) && in_array(strtolower($path_info['extension']), array('png', 'jpg', 'gif', 'jpeg')))) {
                        $dst = $dstRoute.$this->getUnicFileName($dstRoute, $file['name'], $saveOrigFileName);
                        if (!file_exists($dstRoute)) {
                            if (!mkdir($dstRoute)) {
                               $result['ok']  = false;
                               $result['msg'] = 'You do not have rights do this operation.';
                               break;
                            }
                        }
                        if (file_exists($dstRoute) && is_writable($dstRoute)) {
                            try {
                              move_uploaded_file($file['tmp_name'], $dst);
                              $result['ok']  = true;
                              $result['url'] = $dst;
                            } catch (Exception $e) {
                              $result['ok']  = false;
                              $result['msg'] = 'Server error.';
                            }
                        } else {
                            $result['ok']  = false;
                            $result['msg'] = 'You do not have rights do this operation.';
                        }
                    }
                  }
                  break;
                }
                case 'resize': {
                  $srcRoute = $request->request->get('srcRoute', '');
                  $dstRoute = $request->request->get('dstRoute', 'uploads/');


                  //\tool::xlog('up', $srcRoute);
                  //\tool::xlog('up', $dstRoute);

                  if (!file_exists($srcRoute)) {
                    try {
                        if (!mkdir($srcRoute)) {
                            $result['ok']  = false;
                            $result['msg'] = 'You do not have rights do this operation.';
                            break;
                        }
                    } catch (Exception $e) {
                        $result['ok']  = false;
                        $result['msg'] = 'You do not have rights do this operation.';
                        break;
                    }

                  }

                  if (file_exists($srcRoute.$request->request->get('fileName', 'empty'))) {
                    copy($srcRoute.$request->request->get('fileName', 'empty'), $dstRoute.$request->request->get('fileName', 'empty'));
                  }

                  $fileName = $dstRoute.$request->request->get('fileName', 'empty');
                  $noDelete = $request->request->get('noDelete');


                  if (file_exists($fileName)) {

                    $srcImg = $this->loadImage($fileName);

                    $size = getimagesize($fileName);
                    $ratio = $size[0] / $request->request->get('imageWidth', 1);
                    $w = $request->request->get('width', 1)*$ratio;
                    $h = $request->request->get('height', 1)*$ratio;
                    $aspect = $w / $h;
                    if ($h > 1200) {
                      $h = 1200;
                      $w = $h*$aspect;
                    }
                    $w_view = $w;
                    $h_view = $h;
                    $x_view = 0;
                    $y_view = 0;
                    $order = 1;

                    $dstImg = $this->cropPhoto($srcImg, $request->request->get('x', 1)*$ratio, $request->request->get('y', 1)*$ratio, $request->request->get('width', 1)*$ratio, $request->request->get('height', 1)*$ratio, $w, $h);

                    imagedestroy($srcImg);

                    $path_info = pathinfo($fileName);
                    $outFileName = $path_info['filename'].'.png';
                    // Если нужно сохраняем исходный файл
                    if ($srcRoute !== '') {
                      //copy($fileName, $srcRoute.$request->request->get('fileName', 'empty'));
                      if ($noDelete == null) {

                        imagepng($this->loadImage($fileName), $srcRoute.$outFileName, 9);
                      }
                    }

                    unlink($fileName);



                    $resConvert = imagepng($dstImg, $dstRoute.$outFileName, 9);

                    imagedestroy($dstImg);

                    if ($resConvert == true) {
                      $result['ok']  = true;
                      $result['url'] = $dstRoute.$outFileName;
                      $result['dstRoute'] = $dstRoute;
                      $result['srcRoute'] = $srcRoute;
                      $result['fileName'] = $outFileName;
                    }
                  }
                  break;
                }
                case 'delete': {
                  $fileName = $request->request->get('fileName', 'empty');
                  unlink($fileName);
                  $result['ok']  = true;
                  break;
                }
            }
            return new Response(json_encode($result));
        } else {
            return new Response('Access Denied.');
        }
    }

}
