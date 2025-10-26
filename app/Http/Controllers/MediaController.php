<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends Controller
{
    /**
     * Upload media files
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'media' => 'required|array',
            'media.*' => 'file|mimes:jpeg,png,jpg,gif,webp,mp4,avi,mov|max:10240', // 10MB max
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
            'collection' => 'sometimes|string|in:attachments,images,videos,documents'
        ]);

        try {
            $modelClass = $request->get('model_type');
            $modelId = $request->get('model_id');
            $collection = $request->get('collection', 'attachments');

            // Find the model instance
            $model = $modelClass::findOrFail($modelId);

            $uploadedMedia = [];

            foreach ($request->file('media') as $file) {
                $media = $model->addMediaFromRequest('media')
                    ->usingName($file->getClientOriginalName())
                    ->usingFileName($file->getClientOriginalName())
                    ->toMediaCollection($collection);

                $uploadedMedia[] = [
                    'id' => $media->id,
                    'name' => $media->name,
                    'file_name' => $media->file_name,
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                    'url' => $media->getUrl(),
                    'thumb_url' => $media->getUrl('thumb'),
                    'collection' => $media->collection_name,
                    'created_at' => $media->created_at,
                ];
            }

            return response()->json([
                'message' => 'Mídia enviada com sucesso',
                'media' => $uploadedMedia
            ], 201);

        } catch (\Exception $e) {
            Log::error('MediaController::upload - Erro ao fazer upload', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erro ao fazer upload da mídia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get media files for a model
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
            'collection' => 'sometimes|string'
        ]);

        try {
            $modelClass = $request->get('model_type');
            $modelId = $request->get('model_id');
            $collection = $request->get('collection');

            $model = $modelClass::findOrFail($modelId);

            $mediaQuery = $model->media();
            if ($collection) {
                $mediaQuery->where('collection_name', $collection);
            }

            $media = $mediaQuery->get()->map(function ($media) {
                return [
                    'id' => $media->id,
                    'name' => $media->name,
                    'file_name' => $media->file_name,
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                    'url' => $media->getUrl(),
                    'thumb_url' => $media->getUrl('thumb'),
                    'collection' => $media->collection_name,
                    'created_at' => $media->created_at,
                ];
            });

            return response()->json([
                'media' => $media
            ]);

        } catch (\Exception $e) {
            Log::error('MediaController::index - Erro ao buscar mídia', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erro ao buscar mídia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a media file
     */
    public function destroy(Media $media): JsonResponse
    {
        try {
            $mediaId = $media->id;
            $media->delete();

            return response()->json([
                'message' => 'Mídia excluída com sucesso',
                'media_id' => $mediaId
            ]);

        } catch (\Exception $e) {
            Log::error('MediaController::destroy - Erro ao excluir mídia', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erro ao excluir mídia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get media URL
     */
    public function url(Media $media, string $conversion = null): JsonResponse
    {
        try {
            $url = $conversion ? $media->getUrl($conversion) : $media->getUrl();

            return response()->json([
                'url' => $url,
                'conversion' => $conversion,
                'media_id' => $media->id
            ]);

        } catch (\Exception $e) {
            Log::error('MediaController::url - Erro ao obter URL da mídia', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erro ao obter URL da mídia',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
