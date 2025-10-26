@extends('layouts.react')

@section('title', 'Editar ' . $campaign->name . ' - Salão da Guilda')

@section('content')
<!-- Campaign Edit - React Component will be loaded here -->
<div id="campaign-edit-app" data-campaign-id="{{ $campaign->id }}" data-campaign-data="{{ json_encode($campaign) }}" data-tags="{{ json_encode($tags) }}" data-campaign-tags="{{ json_encode($campaignTags) }}"></div>
@endsection
